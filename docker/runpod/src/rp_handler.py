import time
import subprocess
import os
import json
import logging
import runpod
import requests
from requests.adapters import HTTPAdapter, Retry

# Environment variable handling
try:
    TIMEOUT = int(os.environ.get("RUNPOD_REQUEST_TIMEOUT", "600"))
except ValueError:
    TIMEOUT = 600

LOCAL_URL = os.environ.get("API_URL", "http://127.0.0.1:3000")

cog_session = requests.Session()
retries = Retry(total=10, backoff_factor=1.0, status_forcelist=[502, 503, 504])
cog_session.mount('http://', HTTPAdapter(max_retries=retries))

# ---------------------------------------------------------------------------- #
#                              Automatic Functions                             #
# ---------------------------------------------------------------------------- #
def wait_for_service(url, max_attempts=120):
    '''
    Check if the service is ready to receive requests.
    '''
    attempts = 0
    while attempts < max_attempts:
        try:
            health = requests.get(url, timeout=1)
            if health.status_code == 200:
                time.sleep(1)
                return
        except requests.exceptions.RequestException:
            print("Service not ready yet. Retrying...")
        except Exception as err:
            print("Error: ", err)

        time.sleep(1)
        attempts += 1
    raise Exception("Service failed to become ready after maximum attempts")

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

def run_inference(endpoint, body):
    '''
    Run inference on a request.
    '''
    try:
        response = cog_session.post(url=f'{LOCAL_URL}/{endpoint}', json=body, timeout=TIMEOUT)
        if response.status_code != 200:
            print(f"Request failed - reason: HTTP_{response.status_code} {response.text}")
            raise ValueError(f"{error_message}. Raw response: {response.text}")
        response.raise_for_status()
        return response.json()
    except requests.exceptions.JSONDecodeError:
        raise ValueError(f"Invalid JSON response from server")
    except requests.exceptions.RequestException as e:
        raise ValueError(f"Request failed: {str(e)}")

def handler(job):
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
    response_data = run_inference(endpoint, body)
    return response_data

if __name__ == "__main__":
    wait_for_service(url=f'{LOCAL_URL}/health')

    print("API Service is ready. Starting RunPod serverless handler...")

    runpod.serverless.start({"handler": handler})
