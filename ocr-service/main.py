from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from PIL import Image
import pytesseract
import io
import logging

app = FastAPI(
    title="AIBOS Tesseract OCR Service",
    description="OCR service for invoice processing with multi-tenant support",
    version="1.0.0"
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.get("/")
async def root():
    return {
        "service": "AIBOS Tesseract OCR",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for Docker healthcheck"""
    try:
        version = pytesseract.get_tesseract_version()
        return {
            "status": "healthy",
            "service": "tesseract-ocr",
            "tesseract_version": str(version)
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ocr")
async def perform_ocr(file: UploadFile = File(...)):
    """
    Perform OCR on uploaded image or PDF
    
    Returns:
        - text: Extracted text content
        - confidence: Average OCR confidence (0-100)
        - metadata: Additional information about the processing
    """
    try:
        logger.info(f"Processing file: {file.filename}, content_type: {file.content_type}")
        
        # Read file
        file_bytes = await file.read()
        
        # Handle PDF vs Image
        if file.content_type == "application/pdf":
            # Convert PDF to image (first page only for now)
            from pdf2image import convert_from_bytes
            images = convert_from_bytes(file_bytes, first_page=1, last_page=1)
            image = images[0]
            logger.info(f"Converted PDF to image: {image.size}")
        else:
            # Open as image
            image = Image.open(io.BytesIO(file_bytes))
        
        logger.info(f"Image size: {image.size}, mode: {image.mode}")
        
        # Perform OCR with PSM 1 (Automatic page segmentation with OSD)
        text = pytesseract.image_to_string(image, config='--psm 1')
        
        # Get detailed data with confidence scores
        data = pytesseract.image_to_data(
            image,
            output_type=pytesseract.Output.DICT,
            config='--psm 1'
        )
        
        # Calculate average confidence (skip -1 values which mean no text detected)
        confidences = [c for c in data['conf'] if c != -1]
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0
        
        # Extract useful metadata
        has_numbers = any(c.isdigit() for c in text)
        has_currency = any(c in '$£€¥' for c in text)
        
        logger.info(
            f"OCR completed: {len(text)} chars, "
            f"confidence: {avg_confidence:.2f}%, "
            f"has_numbers: {has_numbers}, has_currency: {has_currency}"
        )
        
        return JSONResponse({
            "success": True,
            "text": text,
            "confidence": round(avg_confidence, 2),
            "method": "tesseract",
            "metadata": {
                "char_count": len(text),
                "word_count": len(text.split()),
                "line_count": len(text.split('\n')),
                "has_numbers": has_numbers,
                "has_currency": has_currency,
                "image_size": f"{image.size[0]}x{image.size[1]}",
            }
        })
        
    except Exception as e:
        logger.error(f"OCR error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "error": str(e),
                "method": "tesseract",
                "file": file.filename
            }
        )

@app.post("/ocr-with-layout")
async def ocr_with_layout(file: UploadFile = File(...)):
    """
    OCR with bounding box information - useful for structured data extraction
    
    Returns structured data with coordinates for each detected text element
    """
    try:
        file_bytes = await file.read()
        
        if file.content_type == "application/pdf":
            from pdf2image import convert_from_bytes
            images = convert_from_bytes(file_bytes, first_page=1, last_page=1)
            image = images[0]
        else:
            image = Image.open(io.BytesIO(file_bytes))
        
        # Get detailed layout data
        data = pytesseract.image_to_data(
            image,
            output_type=pytesseract.Output.DICT,
            config='--psm 1'
        )
        
        # Filter out empty entries and structure the results
        results = []
        for i in range(len(data['text'])):
            if data['conf'][i] != -1 and data['text'][i].strip():
                results.append({
                    'text': data['text'][i],
                    'confidence': data['conf'][i],
                    'bbox': {
                        'left': data['left'][i],
                        'top': data['top'][i],
                        'width': data['width'][i],
                        'height': data['height'][i],
                    },
                    'level': data['level'][i],  # Word level (1-5)
                })
        
        logger.info(f"Layout OCR completed: {len(results)} text elements detected")
        
        return JSONResponse({
            "success": True,
            "results": results,
            "method": "tesseract-layout",
            "total_words": len(results)
        })
        
    except Exception as e:
        logger.error(f"Layout OCR error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={"error": str(e)}
        )

