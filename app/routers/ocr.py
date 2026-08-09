import easyocr
from fastapi import APIRouter, File, UploadFile, HTTPException
import io
from PIL import Image

router = APIRouter(prefix="/api/v1/ocr", tags=["OCR"])

# Initialize OCR reader
ocr_reader = easyocr.Reader(['en', 'bn'])


@router.post("/extract-text")
async def extract_text_from_image(file: UploadFile = File(...)):

    # 1. Check file type
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid image format. Upload JPEG or PNG."
        )

    try:
        # 2. Read uploaded image
        image_bytes = await file.read()

        # 3. Open image
        image = Image.open(io.BytesIO(image_bytes))

        # 4. Perform OCR
        results = ocr_reader.readtext(image_bytes, detail=0)

        # 5. Combine detected text
        extracted_text = " ".join(results)

        # 6. Return result
        return {
            "status": "success",
            "extracted_text": extracted_text,
            "has_text": len(extracted_text.strip()) > 0
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"OCR Processing failed: {str(e)}"
        )