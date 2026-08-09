from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import FileResponse
from gtts import gTTS
from groq import Groq
from dotenv import load_dotenv

import os
import tempfile


# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

load_dotenv()

groq_api_key = os.getenv("GROQ_API_KEY")

if not groq_api_key:
    raise RuntimeError("GROQ_API_KEY is not configured.")

groq_client = Groq(api_key=groq_api_key)


# =========================================================
# FASTAPI ROUTER
# =========================================================

router = APIRouter(
    prefix="/api/v1/voice",
    tags=["Voice"]
)


# =========================================================
# 1. SPEECH TO TEXT + TRANSLATION
# =========================================================

@router.post("/process-audio")
async def process_voice_input(
    file: UploadFile = File(...),
    language: str = Form("auto")
):

    # -----------------------------------------------------
    # Allowed audio formats
    # -----------------------------------------------------

    allowed_types = {
        "audio/mpeg",
        "audio/mp3",
        "audio/wav",
        "audio/x-wav",
        "audio/mp4",
        "audio/m4a",
        "audio/x-m4a",
        "audio/ogg",
        "audio/webm"
    }

    # -----------------------------------------------------
    # Supported languages
    # en = English
    # hi = Hindi
    # bn = Bengali
    # auto = Automatic detection
    # -----------------------------------------------------

    supported_languages = {
        "en",
        "hi",
        "bn",
        "auto"
    }

    # -----------------------------------------------------
    # Validate language
    # -----------------------------------------------------

    if language not in supported_languages:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported language. "
                "Use 'en', 'hi', 'bn', or 'auto'."
            )
        )

    # -----------------------------------------------------
    # Validate audio format
    # -----------------------------------------------------

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported audio format: {file.content_type}"
        )

    try:

        # =================================================
        # STEP 1: READ AUDIO
        # =================================================

        audio_bytes = await file.read()

        if not audio_bytes:
            raise HTTPException(
                status_code=400,
                detail="Uploaded audio file is empty."
            )

        # =================================================
        # STEP 2: PREPARE WHISPER REQUEST
        # =================================================

        transcription_params = {
    "file": (
        file.filename,
        audio_bytes,
        file.content_type
    ),

    # More accurate multilingual model
    "model": "whisper-large-v3",

    # Detailed response
    "response_format": "verbose_json",

    # Deterministic transcription
    "temperature": 0.0
}

        # -------------------------------------------------
        # IMPORTANT:
        #
        # If the frontend/user explicitly selects a
        # language, tell Whisper the language.
        #
        # If "auto" is selected, DON'T force a language.
        # Whisper will detect it automatically.
        # -------------------------------------------------

        if language != "auto":
            transcription_params["language"] = language

        # =================================================
        # STEP 3: SPEECH → TEXT
        # =================================================

        transcription = groq_client.audio.transcriptions.create(
            **transcription_params
        )

        # =================================================
        # STEP 4: GET TRANSCRIBED TEXT
        # =================================================

        spoken_text = transcription.text.strip()

        if not spoken_text:
            raise HTTPException(
                status_code=400,
                detail="Could not detect speech in the audio."
            )

        # =================================================
        # STEP 5: DETECT / DETERMINE LANGUAGE
        # =================================================

        if language == "auto":

            detected_lang = getattr(
                transcription,
                "language",
                "unknown"
            )

        else:

            # We explicitly told Whisper the language
            detected_lang = language

        # =================================================
        # STEP 6: TRANSLATE TO ENGLISH
        # =================================================

        if detected_lang == "en":

            # Already English
            translated_text = spoken_text

        else:

            # -------------------------------------------------
            # Use Groq LLM for translation.
            #
            # This is more reliable for contextual sentences
            # than using a simple translation library.
            # -------------------------------------------------

            translation_response = (
                groq_client.chat.completions.create(

                    model="llama-3.1-8b-instant",

                    messages=[
                        {
                            "role": "system",
                            "content": (
                                "You are a professional multilingual "
                                "translator for a citizen grievance "
                                "management system. "
                                "Translate the user's text into clear, "
                                "natural English. "
                                "Preserve the exact meaning of the "
                                "original sentence. "
                                "Do not add information. "
                                "Do not explain the translation. "
                                "Return ONLY the English translation."
                            )
                        },
                        {
                            "role": "user",
                            "content": spoken_text
                        }
                    ],

                    temperature=0
                )
            )

            translated_text = (
                translation_response
                .choices[0]
                .message
                .content
                .strip()
            )

        # =================================================
        # STEP 7: RETURN RESPONSE
        # =================================================

        return {
            "status": "success",
            "original_language": detected_lang,
            "transcribed_text": spoken_text,
            "english_translation": translated_text
        }

    # -----------------------------------------------------
    # Preserve our own HTTP errors
    # -----------------------------------------------------

    except HTTPException:
        raise

    # -----------------------------------------------------
    # Catch unexpected errors
    # -----------------------------------------------------

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Voice processing failed: {str(e)}"
        )


# =========================================================
# 2. TEXT TO SPEECH
# =========================================================

@router.post("/text-to-speech")
async def generate_speech(
    text: str = Form(...),
    lang: str = Form("hi")
):

    # -----------------------------------------------------
    # Supported TTS languages
    # -----------------------------------------------------

    supported_languages = {
        "en",
        "hi",
        "bn"
    }

    # -----------------------------------------------------
    # Validate language
    # -----------------------------------------------------

    if lang not in supported_languages:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Unsupported language '{lang}'. "
                "Supported languages are: en, hi, bn."
            )
        )

    # -----------------------------------------------------
    # Validate text
    # -----------------------------------------------------

    if not text.strip():
        raise HTTPException(
            status_code=400,
            detail="Text cannot be empty."
        )

    try:

        # =================================================
        # STEP 1: TRANSLATE AI RESPONSE
        # =================================================
        #
        # The AI response is assumed to be English.
        #
        # If citizen wants Bengali:
        #       English → Bengali
        #
        # If citizen wants Hindi:
        #       English → Hindi
        #
        # If citizen wants English:
        #       English → English
        # =================================================

        if lang == "en":

            translated_response = text

        else:

            translation_response = (
                groq_client.chat.completions.create(

                    model="llama-3.1-8b-instant",

                    messages=[
                        {
                            "role": "system",
                            "content": (
                                "You are a professional translator. "
                                "Translate the provided English text "
                                "into the requested language. "
                                "Preserve the exact meaning. "
                                "Do not add explanations."
                            )
                        },
                        {
                            "role": "user",
                            "content": (
                                f"Translate this English text into "
                                f"{'Bengali' if lang == 'bn' else 'Hindi'}:\n\n"
                                f"{text}"
                            )
                        }
                    ],

                    temperature=0
                )
            )

            translated_response = (
                translation_response
                .choices[0]
                .message
                .content
                .strip()
            )

        # =================================================
        # STEP 2: CREATE AUDIO
        # =================================================

        temp_speech = tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".mp3"
        )

        temp_speech.close()

        tts = gTTS(
            text=translated_response,
            lang=lang
        )

        tts.save(temp_speech.name)

        # =================================================
        # STEP 3: RETURN AUDIO FILE
        # =================================================

        return FileResponse(
            temp_speech.name,
            media_type="audio/mpeg",
            filename="response.mp3"
        )

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"TTS failed: {str(e)}"
        )