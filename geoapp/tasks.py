from celery import shared_task
import logging

logger = logging.getLogger(__name__)

@shared_task(name='geoapp.tasks.fetch_satellite_images')
def fetch_satellite_images(region_id=None, days=7, cloud_cover_max=30):
    """
    Task to fetch satellite images from external sources and process them.

    Parameters:
    - region_id: ID of the region to fetch images for (optional)
    - days: Number of past days to fetch images for (default: 7)
    - cloud_cover_max: Maximum allowed cloud cover percentage (default: 30)

    Returns:
    - dict: A dictionary containing task status and results
    """
    logger.info(f"Simplified fetch_satellite_images called with region_id={region_id}, days={days}, cloud_cover_max={cloud_cover_max}")
    # Minimal logic for testing
    try:
        # Simulate some work
        result_message = "Task executed with minimal logic."
        logger.info(result_message)
        return {"status": "success", "message": result_message, "region_id": region_id}
    except Exception as e:
        error_message = f"Error in simplified fetch_satellite_images: {e}"
        logger.error(error_message)
        # It's important for Celery tasks to be able to serialize their return values.
        # Returning a simple dictionary is generally safe.
        return {"status": "error", "message": error_message, "details": str(e)}
