import os
import tempfile

import whisper
from gtts import gTTS
from deep_translator import GoogleTranslator

from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import FileResponse


router = APIRouter(
    prefix="/api/v1/voice",
    tags=["Voice"]
)


# Load Whisper model once when the service starts
whisper_model = whisper.load_model("base")


# =========================================================
# SPEECH TO TEXT
# =========================================================

@router.post("/speech-to-text")
async def speech_to_text(
    file: UploadFile = File(...)
):

    allowed_types = [
        "audio/mpeg",
        "audio/wav",
        "audio/x-wav",
        "audio/mp4",
        "audio/webm",
        "audio/ogg"
    ]

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Unsupported audio format."
        )

    temp_audio_path = None

    try:
        # -----------------------------------------
        # 1. Save uploaded audio
        # -----------------------------------------

        suffix = os.path.splitext(
            file.filename or ""
        )[1] or ".wav"

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix
        ) as temp_file:

            temp_file.write(await file.read())
            temp_audio_path = temp_file.name

        # -----------------------------------------
        # 2. Let Whisper automatically detect
        #    the spoken language
        # -----------------------------------------

        result = whisper_model.transcribe(
            temp_audio_path,
            task="transcribe",
            fp16=False
        )

        # -----------------------------------------
        # 3. Get detected language
        # -----------------------------------------

        detected_language = result.get(
            "language",
            "unknown"
        )

        # -----------------------------------------
        # 4. Get transcription
        # -----------------------------------------

        text = result.get(
            "text",
            ""
        ).strip()

        print("====================================")
        print("Detected language:", detected_language)
        print("Transcription:", text)
        print("====================================")

        # -----------------------------------------
        # 5. Return ONLY original transcription
        # -----------------------------------------

        return {
            "status": "success",
            "original_text": text,
            "source_language": detected_language
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Speech recognition failed: {str(e)}"
        )

    finally:

        if (
            temp_audio_path
            and os.path.exists(temp_audio_path)
        ):
            os.remove(temp_audio_path)
# =========================================================
# TRANSLATION
# =========================================================

@router.post("/translate")
async def translate_text(
    text: str,
    target_language: str = "en"
):

    try:

        translated = GoogleTranslator(
            source="auto",
            target=target_language
        ).translate(text)

        return {
            "status": "success",
            "original_text": text,
            "translated_text": translated,
            "target_language": target_language
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Translation failed: {str(e)}"
        )


# =========================================================
# TEXT TO SPEECH
# =========================================================

@router.post("/text-to-speech")
async def text_to_speech(
    text: str,
    language: str = "en"
):

    try:

        output_file = tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".mp3"
        )

        output_file.close()

        tts = gTTS(
            text=text,
            lang=language,
            slow=False
        )

        tts.save(output_file.name)

        return FileResponse(
            output_file.name,
            media_type="audio/mpeg",
            filename="response.mp3"
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Text-to-speech failed: {str(e)}"
        )