import time
import subprocess
import os
import json
import logging
import runpod
import aiohttp
import asyncio
from aiohttp import ClientTimeout

# Environment variable handling
try:
    TIMEOUT = int(os.environ.get("RUNPOD_REQUEST_TIMEOUT", "600"))
except ValueError:
    TIMEOUT = 600

LOCAL_URL = os.environ.get("API_URL", "http://127.0.0.1:3000")

async_session = None
session_lock = asyncio.Lock()

# ---------------------------------------------------------------------------- #
#                              Automatic Functions                             #
# ---------------------------------------------------------------------------- #
async def wait_for_service(url, max_attempts=240):
    '''
    Check if the service is ready to receive requests.
    '''
    connector = aiohttp.TCPConnector(ssl=False)
    timeout_health = ClientTimeout(total=1)
    local_session = aiohttp.ClientSession(timeout=timeout_health, connector=connector)
    try:
        attempts = 0
        while attempts < max_attempts:
            try:
                async with local_session.get(url) as health:
                    if health.status == 200:
                        await asyncio.sleep(1)
                        return 200, None
            except aiohttp.ClientError:
                print("Service not ready yet. Waiting for a second...")
            except Exception as err:
                print("Error: ", err)

            await asyncio.sleep(1)
            attempts += 1
            
        # Don't use "raise Exception()" before runpod.serverless.start() because that will cause Runpod worker to run indefinitely.
        print("Service failed to become ready after maximum attempts")
        return 504, "Service failed to become ready after maximum attempts"
    finally:
        await local_session.close()

def validate_input(job_input):
    """
    Validates the input for the handler function.

    Args:
        job_input (dict): The input data to validate.

    Returns:
        tuple: A tuple containing the validated data and an error message, if any.
               The structure is (validated_data, error_message).
    """
    # Validate if job_input is provided
    if job_input is None:
        return None, "Please provide input"

    # Check if input is a string and try to parse it as JSON
    if isinstance(job_input, str):
        try:
            job_input = json.loads(job_input)
        except json.JSONDecodeError:
            return None, "Invalid JSON format in input"

    # Validate 'endpoint' in input
    endpoint = job_input.get("endpoint")
    if endpoint is None:
        return None, "Missing 'endpoint' parameter"

    # Validate 'body' in input, if provided
    body = job_input.get("body")
    if body is None:
        return None, "Missing 'body' parameter"

    # Return validated data and no error
    return {"endpoint": endpoint, "body": body}, None

async def run_inference(endpoint, body):
    '''
    Run inference on a request.
    '''
    global async_session
    async with session_lock:
        if async_session is None:
            connector = aiohttp.TCPConnector(ssl=False)
            timeout = ClientTimeout(total=TIMEOUT)
            async_session = aiohttp.ClientSession(timeout=timeout, connector=connector)

    max_retries = 5
    for attempt in range(max_retries + 1):
        try:
            async with async_session.post(url=f'{LOCAL_URL}/{endpoint}', json=body) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    if response.status not in [502, 503, 504] or attempt >= max_retries:
                        text = await response.text()
                        raise ValueError(f"Request failed - reason: HTTP_{response.status} {text}")
                    else:
                        text = await response.text()
                        print(f"Request failed - reason: HTTP_{response.status} {text}")
        except (aiohttp.ContentTypeError, json.JSONDecodeError):
            raise ValueError(f"Invalid JSON response from server")
        except aiohttp.ClientError as e:
            if attempt >= max_retries:
                raise ValueError(f"Request failed: {str(e)}")
        except Exception as e:
            raise ValueError(f"Request failed: {str(e)}")
        
        if attempt < max_retries:
            sleep_time = 1.0 * (2 ** min(attempt, 3))
            await asyncio.sleep(sleep_time)

async def handler(job):
    '''
    This is the handler function that will be called by the serverless.
    '''
    job_input = job["input"]
    validated_data, error_message = validate_input(job_input)
    if error_message:
        return {"error": error_message}

    # Extract validated data
    endpoint = validated_data["endpoint"]
    body = validated_data["body"]
    response_data = await run_inference(endpoint, body)
    return response_data

def init_failed(job):
    '''
    This function will always return an error.
    '''
    return {"error": "service failed to start"}
    
def adjust_concurrency(current_concurrency):
    return 3
    
if __name__ == "__main__":
    # Don't use "raise Exception()" before runpod.serverless.start() because that will cause Runpod worker to run indefinitely.
    http_code, error_message = asyncio.run(wait_for_service(url=f'{LOCAL_URL}/health'))
    if error_message is None:
        print("API Service is ready. Starting RunPod serverless handler...")
        runpod.serverless.start({
            "handler": handler,
            "concurrency_modifier": adjust_concurrency
        })
    else:
        runpod.serverless.start({"handler": init_failed})
