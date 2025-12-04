from comfy_script.runtime import *
load('http://127.0.0.1:8188/')
from comfy_script.runtime.nodes import *

with Workflow(wait=True):
  prompt = 'replace background with bedroom. <sam><rmbg><upscale><restoreface>'
  prompt_lower = prompt.lower()
  prompt_clean = RegexReplace(prompt, r'\<.*\>', '', True, False, False, 0)
  seed = 232215314385576
  model = NunchakuQwenImageDiTLoader(model_name='svdq-int4_r32-qwen-image-edit-2509-lightningv2.0-4steps.safetensors',
                                     cpu_offload='auto', num_blocks_on_gpu=20, use_pin_memory='disable')
  model = NunchakuQwenImageLoraStack(model=model, lora_count=10, cpu_offload='auto',
                                     lora_name_1='qwenMysticxxxV1.rkUk.safetensors', lora_strength_1=0.5,
                                     lora_name_2='consistenceEditV2.WOzE.safetensors', lora_strength_2=0.3,
                                     lora_name_3='MEXX_QWEN_TG300_23.safetensors', lora_strength_3=0.8,
                                     lora_name_4='None', lora_strength_4=1,
                                     lora_name_5='None', lora_strength_5=1,
                                     lora_name_6='None', lora_strength_6=1,
                                     lora_name_7='None', lora_strength_7=1,
                                     lora_name_8='None', lora_strength_8=1,
                                     lora_name_9='None', lora_strength_9=1,
                                     lora_name_10='None', lora_strength10=1)
  model = ModelSamplingAuraFlow(model=model, shift=3)
  model = CFGNorm(model=model, strength=1)
  
  clip = CLIPLoader(clip_name='qwen_2.5_vl_7b_fp8_scaled.safetensors', type='qwen_image', device='default')
  vae = VAEUtilsCustomVAELoader('Wan2.1_VAE_upscale2x_imageonly_real_v1.safetensors')
  # image, _ = LoadImage('8aad8722-94bd-4ec9-9293-a176abdd99b2.jpg')
  image, _ = LoadImage('12b205a4-6106-4805-9707-17b764395b51.jpg')
  width, height, _ = GetImageSize(image)
  image = FluxKontextImageScale(image)
  
  mathImageSize = EasyMathInt(width, height, 'multiply')
  imageMegapixels = 1
  mathOutputSize = EasyMathInt(EasyInt(imageMegapixels), 1048576, 'multiply')

  # Downscaling big input image
  if EasyCompare(mathImageSize, mathOutputSize, 'a > b'):
    image = FluxKontextImageScale(image)
  
  # Upscaling
  if '<upscale>' in prompt_lower:
    upscale_model = UpscaleModelLoader('RealESRGAN_x4plus.safetensors')
    image = ImageUpscaleWithModel(upscale_model, image)
    image = FluxKontextImageScale(image)
  
  # Resizing to the correct output size
  mathImageSize = EasyMathInt(width, height, 'multiply')
  if EasyCompare(mathImageSize, mathOutputSize, 'a != b'):
    image = FluxKontextImageScale(image)
    
  # Segmentation
  if '<sam>' in prompt_lower:
    _, mask, _ = SAM3Segment(image=image, prompt='clothes', sam3_model='sam3', device='Auto', 
                             confidence_threshold=0.35, mask_blur=0, mask_offset=0, invert_output=False, 
                             background='Color', background_color='#000000')
    mask = MaskFix(mask=mask, erode_dilate=2, fill_holes=20, remove_isolated_pixels=0, smooth=0, blur=0)
    # mask = AILabMaskCombiner(mask, 'combine', mask, None, None)
    image, _ = AILabMaskOverlay(mask_opacity=1, mask_color='#000000', image=image, mask=mask)
  
  # Background removal
  if '<rmbg>' in prompt_lower:
    width, height, _ = GetImageSize(image)
    image_back = EmptyImage(width=width, height=height, batch_size=1, color=0)
    image_rmbg, mask_rmbg, _ = Rmbg(image=image, model='RMBG-2.0', sensitivity=1, process_res=1120, 
                                    mask_blur=0, mask_offset=0, invert_output=False, refine_foreground=False, 
                                    background='Alpha', background_color='#ffffff')
    image = ImageCompositeMasked(destination=image_back, source=image_rmbg, x=0, y=0, resize_source=False, mask=mask_rmbg)

  # Qwen Edit
  positive = TextEncodeQwenImageEditPlus(clip=clip, prompt=prompt_clean, vae=vae, image1=image, image2=None, image3=None)
  negative = ConditioningZeroOut(positive)
  latent = VAEEncode(image, vae)
  latent = KSampler(model=model, seed=seed, steps=4, cfg=1, sampler_name='euler', scheduler='simple', 
                    positive=positive, negative=negative, latent_image=latent, denoise=1)
  imageout = VAEUtilsVAEDecodeTiled(samples=latent, vae=vae, upscale=2, tile=False, tile_size=512, overlap=64, temporal_size=4096, temporal_overlap=64)
  imageout = ImageScaleBy(image=imageout, upscale_method='lanczos', scale_by=0.5)
  
  # Face restoration.
  if '<restoreface>' in prompt_lower:
    imageout = ReActorRestoreFaceAdvanced(image=imageout, facedetection='retinaface_resnet50', model='codeformer.pth', 
                                          visibility=1, codeformer_weight=0.5, face_selection='all', sort_by='area', reverse_order=False,
                                          take_start=0, take_count=10)
  
  SaveImage(images=imageout, filename_prefix='ComfyUI')
