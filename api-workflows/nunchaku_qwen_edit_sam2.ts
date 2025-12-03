import { z } from "zod";
// This gets evaluated in the context of src/workflows, so imports must be relative to that directory
import { ComfyPrompt, Workflow } from "../types";
import config from "../config";

const RequestSchema = z.object({
  image: z
    .string()
    .describe("Main input image for editing (URL or base64 encoded string)"),
  image_2: z
    .string()
    .default("")
    .describe("Second input image (URL or base64 encoded string), not used in this workflow"),
  image_3: z
    .string()
    .default("")
    .describe("Third input image (URL or base64 encoded string), not used in this workflow"),
  prompt: z
    .string()
    .default(
      "remove black dots. <sam>\n===\nshe wears trending clothes."
    )
    .describe(
      "The editing instructions for the image generation. Use tags like <sam>, <rmbg>, <restoreface>, and <upscale> to enable those features."
    ),
  seed: z
    .number()
    .default(() => Math.floor(Math.random() * 1000000000000000))
    .describe("Seed for random number generation"),
  steps: z.number().min(1).max(100).default(4).describe("Number of sampling steps"),
  cfg_scale: z
    .number()
    .min(0)
    .max(20)
    .default(1)
    .describe("Classifier-free guidance scale"),
  sampler_name: config.samplers
    .default("euler")
    .describe("Name of the sampler to use"),
  scheduler: config.schedulers
    .default("simple")
    .describe("Type of scheduler to use"),
  denoise: z.number().min(0).max(1).default(1).describe("Denoising strength"),
  aura_flow_shift: z
    .number()
    .default(3)
    .describe("Aura Flow model sampling shift value"),
  cfg_norm_strength: z
    .number()
    .default(1)
    .describe("Strength for CFG Normalization"),
  megapixels: z
    .number()
    .default(1)
    .describe("Total megapixels to scale the image to if upscaling is enabled"),
  upscaler_model_name: z
    .string()
    .default("RealESRGAN_x4plus.safetensors")
    .describe("Name of the upscaler model to use"),
  sam_prompt: z.string().default("clothes").describe("Prompt for SAM segmentation"),
  sam2_model: z.string().default("sam2.1_hiera_large").describe("SAM2 model to use"),
  dino_model: z
    .string()
    .default("GroundingDINO_SwinB (938MB)")
    .describe("DINO model for SAM grounding"),
  sam3_model: z.string().default("sam3").describe("SAM3 model to use"),
  sam_threshold: z.number().default(0.35).describe("Threshold for SAM segmentation"),
  sam_mask_blur: z.number().default(0).describe("Mask blur for SAM segmentation"),
  sam_mask_offset: z.number().default(0).describe("Mask offset for SAM segmentation"),
  sam_invert_output: z
    .boolean()
    .default(false)
    .describe("Invert the output mask from SAM"),
  sam_background_color: z
    .string()
    .default("#000000")
    .describe("Background color of the mask for SAM segmentation"),
  mask_fix_erode_dilate: z
    .number()
    .default(2)
    .describe("Erode/dilate value for mask fixing"),
  mask_fix_fill_holes: z
    .number()
    .default(20)
    .describe("Fill holes value for mask fixing"),
  mask_fix_remove_isolated: z
    .number()
    .default(0)
    .describe("Remove isolated pixels value for mask fixing"),
  mask_fix_smooth: z.number().default(0).describe("Smooth value for mask fixing"),
  mask_fix_blur: z.number().default(0).describe("Blur value for mask fixing"),
  rmbg_model: z
    .string()
    .default("RMBG-2.0")
    .describe("Model to use for background removal"),
  rmbg_sensitivity: z
    .number()
    .default(1)
    .describe("Sensitivity of the background removal"),
  rmbg_process_res: z
    .number()
    .default(1120)
    .describe("Process resolution of the background removal"),
  rmbg_mask_blur: z
    .number()
    .default(0)
    .describe("Mask blur of the background removal"),
  rmbg_mask_offset: z
    .number()
    .default(0)
    .describe("Mask offset of the background removal"),
  rmbg_refine_foreground: z
    .boolean()
    .default(false)
    .describe("Refine foreground of the background removal"),
  face_detection_model: z
    .string()
    .default("retinaface_resnet50")
    .describe("Model to use for face detection in face restoration"),
  face_restore_model: z
    .string()
    .default("codeformer.pth")
    .describe("Model to use for face restoration"),
  face_restore_visibility: z
    .number()
    .min(0)
    .max(1)
    .default(1)
    .describe("Visibility of the restored face"),
  face_restore_take_count: z
    .number()
    .default(10)
    .describe("Take count of the restored face"),
  output_downscale: z
    .number()
    .default(0.5)
    .describe("Downscale factor applied before face restoration"),
  codeformer_weight: z
    .number()
    .min(0)
    .max(1)
    .default(0.5)
    .describe("Weight of the CodeFormer model in face restoration"),
  unet_name: z
    .string()
    .default("svdq-int4_r32-qwen-image-edit-2509-lightningv2.0-4steps.safetensors")
    .describe("Name of the UNET model to load"),
  cpu_offload: z
    .string()
    .default("auto")
    .describe(
      "Indicates whether to offload the main DiT model to the CPU to save GPU memory."
    ),
  num_blocks_on_gpu: z
    .number()
    .min(1)
    .max(200)
    .default(20)
    .describe(
      "Increasing the value keeps more blocks in GPU memory, which minimizes offloading and can lead to faster generation times. "
    ),
  use_pin_memory: z
    .string()
    .default("disable")
    .describe(
      "Pinning memory can speed up data transfers to the GPU by pre-loading data into a special area of the CPU's memory."
    ),
  clip_name: z
    .string()
    .default("qwen_2.5_vl_7b_fp8_scaled.safetensors")
    .describe("Name of the CLIP model to load"),
  use_vae_utils_loader: z
    .boolean()
    .default(true)
    .describe("Whether to use the VAEUtils loader and tiled decoding path"),
  vae_name: z
    .string()
    .default("Wan2.1_VAE_upscale2x_imageonly_real_v1.safetensors")
    .describe("Name of the VAE model to load for the VAEUtils path"),
  vae_upscale: z
    .number()
    .default(2)
    .describe("VAE decode upscale factor for VAEUtils path"),
  vae_tile: z
    .boolean()
    .default(false)
    .describe("Enable tiled VAE decoding for VAEUtils path"),
  vae_tile_size: z
    .number()
    .default(512)
    .describe("Tile size for VAE decoding for VAEUtils path"),
  vae_overlap: z
    .number()
    .default(64)
    .describe("Tile overlap for VAE decoding for VAEUtils path"),
  lora_cpu_offload: z
    .string()
    .default("auto")
    .describe("Offload LoRAs to CPU to save GPU memory"),
  lora_1_name: z
    .string()
    .default("qwen-image-edit-2509-multi-angles.safetensors")
    .describe("Name of the LoRA model to use"),
  lora_1_strength: z.number().default(1).describe("Strength of the LoRA model"),
  lora_2_name: z.string().default("None").describe("Name of the LoRA model to use"),
  lora_2_strength: z.number().default(1).describe("Strength of the LoRA model"),
  lora_3_name: z.string().default("None").describe("Name of the LoRA model to use"),
  lora_3_strength: z.number().default(1).describe("Strength of the LoRA model"),
  lora_4_name: z.string().default("None").describe("Name of the LoRA model to use"),
  lora_4_strength: z.number().default(1).describe("Strength of the LoRA model"),
  lora_5_name: z.string().default("None").describe("Name of the LoRA model to use"),
  lora_5_strength: z.number().default(1).describe("Strength of the LoRA model"),
  lora_6_name: z.string().default("None").describe("Name of the LoRA model to use"),
  lora_6_strength: z.number().default(1).describe("Strength of the LoRA model"),
  lora_7_name: z.string().default("None").describe("Name of the LoRA model to use"),
  lora_7_strength: z.number().default(1).describe("Strength of the LoRA model"),
  lora_8_name: z.string().default("None").describe("Name of the LoRA model to use"),
  lora_8_strength: z.number().default(1).describe("Strength of the LoRA model"),
  lora_9_name: z.string().default("None").describe("Name of the LoRA model to use"),
  lora_9_strength: z.number().default(1).describe("Strength of the LoRA model"),
  lora_10_name: z
    .string()
    .default("None")
    .describe("Name of the LoRA model to use"),
  lora_10_strength: z.number().default(1).describe("Strength of the LoRA model"),
});

type InputType = z.infer<typeof RequestSchema>;

function generateWorkflow(input: InputType): ComfyPrompt {
  const workflow: ComfyPrompt = {
    "37": {
      inputs: {
        model_name: input.unet_name,
        cpu_offload: input.cpu_offload,
        num_blocks_on_gpu: input.num_blocks_on_gpu,
        use_pin_memory: input.use_pin_memory,
      },
      class_type: "NunchakuQwenImageDiTLoader",
    },
    "38": {
      inputs: {
        clip_name: input.clip_name,
        type: "qwen_image",
        device: "default",
      },
      class_type: "CLIPLoader",
    },
    "66": {
      inputs: {
        shift: input.aura_flow_shift,
        model: ["321", 0],
      },
      class_type: "ModelSamplingAuraFlow",
    },
    "75": {
      inputs: {
        strength: input.cfg_norm_strength,
        model: ["66", 0],
      },
      class_type: "CFGNorm",
    },
    "78": {
      inputs: {
        image: input.image,
        "choose file to upload": "image",
      },
      class_type: "LoadImage",
    },
    "88": {
      inputs: {
        pixels: ["252", 0],
        vae: ["303", 0],
      },
      class_type: "VAEEncode",
    },
    "118": {
      inputs: {
        steps: input.steps,
        cfg: input.cfg_scale,
        sampler_name: input.sampler_name,
        scheduler: input.scheduler,
        denoise: input.denoise,
        model: ["75", 0],
        positive: ["128", 0],
        negative: ["129", 0],
        latent_image: ["88", 0],
        seed: ["274", 3],
      },
      class_type: "KSampler",
    },
    "120": {
      inputs: {
        filename_prefix: "ComfyUI",
        images: ["247", 0],
      },
      class_type: "SaveImage",
    },
    "123": {
      inputs: {
        model: input.rmbg_model,
        sensitivity: input.rmbg_sensitivity,
        process_res: input.rmbg_process_res,
        mask_blur: input.rmbg_mask_blur,
        mask_offset: input.rmbg_mask_offset,
        invert_output: false,
        refine_foreground: input.rmbg_refine_foreground,
        background: "Alpha",
        background_color: "#ffffff",
        image: ["325", 0],
      },
      class_type: "RMBG",
    },
    "128": {
      inputs: {
        prompt: ["282", 0],
        clip: ["38", 0],
        vae: ["303", 0],
        image1: ["252", 0],
      },
      class_type: "TextEncodeQwenImageEditPlus",
    },
    "129": {
      inputs: {
        conditioning: ["128", 0],
      },
      class_type: "ConditioningZeroOut",
    },
    "148": {
      inputs: {
        width: ["151", 0],
        height: ["151", 1],
        batch_size: 1,
        color: 0,
      },
      class_type: "EmptyImage",
    },
    "151": {
      inputs: {
        image: ["325", 0],
      },
      class_type: "GetImageSize+",
    },
    "152": {
      inputs: {
        x: 0,
        y: 0,
        resize_source: false,
        destination: ["148", 0],
        source: ["123", 0],
        mask: ["123", 1],
      },
      class_type: "ImageCompositeMasked",
    },
    "153": {
      inputs: {
        model_name: input.upscaler_model_name,
      },
      class_type: "UpscaleModelLoader",
    },
    "154": {
      inputs: {
        upscale_model: ["153", 0],
        image: ["255", 0],
      },
      class_type: "ImageUpscaleWithModel",
    },
    "167": {
      inputs: {
        facedetection: input.face_detection_model,
        model: input.face_restore_model,
        visibility: input.face_restore_visibility,
        codeformer_weight: input.codeformer_weight,
        face_selection: "all",
        sort_by: "area",
        reverse_order: false,
        take_start: 0,
        take_count: input.face_restore_take_count,
        image: ["318", 0],
      },
      class_type: "ReActorRestoreFaceAdvanced",
    },
    "168": {
      inputs: {
        delimiter: "===",
        secondary_delimiter: "",
        start_index: 0,
        skip_every: 0,
        max_count: 8,
        text: ["177", 0],
      },
      class_type: "SpotlessTextSplitByDelimiter",
    },
    "177": {
      inputs: {
        text: input.prompt,
      },
      class_type: "Text Multiline",
    },
    "183": {
      inputs: {
        regex_pattern: "[\r\n]",
        replace: "",
        case_insensitive: true,
        multiline: false,
        dotall: false,
        count: 0,
        string: ["168", 0],
      },
      class_type: "RegexReplace",
    },
    "184": {
      inputs: {
        regex_pattern: "\\<.*\\>",
        replace: "",
        case_insensitive: true,
        multiline: false,
        dotall: false,
        count: 0,
        string: ["183", 0],
      },
      class_type: "RegexReplace",
    },
    "191": {
      inputs: {
        sub_text: "<restoreface>",
        case_insensitive: true,
        text: ["183", 0],
      },
      class_type: "Text Contains",
    },
    "192": {
      inputs: {
        sub_text: "<rmbg>",
        case_insensitive: true,
        text: ["183", 0],
      },
      class_type: "Text Contains",
    },
    "219": {
      inputs: {
        sub_text: "<upscale>",
        case_insensitive: true,
        text: ["183", 0],
      },
      class_type: "Text Contains",
    },
    "227": {
      inputs: {
        image: ["78", 0],
      },
      class_type: "GetImageSize+",
    },
    "228": {
      inputs: {
        operation: "multiply",
        a: ["227", 0],
        b: ["227", 1],
      },
      class_type: "easy mathInt",
    },
    "231": {
      inputs: {
        comparison: "a < b",
        a: ["228", 0],
        b: ["263", 0],
      },
      class_type: "easy compare",
    },
    "247": {
      inputs: {
        cond: ["191", 0],
        tt_value: ["167", 0],
        ff_value: ["318", 0],
      },
      class_type: "ImpactConditionalBranch",
    },
    "252": {
      inputs: {
        cond: ["192", 0],
        tt_value: ["152", 0],
        ff_value: ["325", 0],
      },
      class_type: "ImpactConditionalBranch",
    },
    "253": {
      inputs: {
        cond: ["192", 0],
        tt_value: ["123", 0],
        ff_value: ["325", 0],
      },
      class_type: "ImpactConditionalBranch",
    },
    "254": {
      inputs: {
        cond: ["219", 0],
        tt_value: ["270", 0],
        ff_value: ["269", 0],
      },
      class_type: "ImpactConditionalBranch",
    },
    "255": {
      inputs: {
        cond: ["231", 0],
        tt_value: ["78", 0],
        ff_value: ["269", 0],
      },
      class_type: "ImpactConditionalBranch",
    },
    "261": {
      inputs: {
        value: input.megapixels,
      },
      class_type: "easy int",
    },
    "263": {
      inputs: {
        b: 1048576,
        operation: "multiply",
        a: ["261", 0],
      },
      class_type: "easy mathInt",
    },
    "269": {
      inputs: {
        image: ["78", 0],
      },
      class_type: "FluxKontextImageScale",
    },
    "270": {
      inputs: {
        image: ["154", 0],
      },
      class_type: "FluxKontextImageScale",
    },
    "274": {
      inputs: {
        seed: input.seed,
        control_after_generate: "fixed",
      },
      class_type: "Seed",
    },
    "282": {
      inputs: {
        prompt: ["184", 0],
        version: 1,
        seed: ["274", 3],
      },
      class_type: "Stable Wildcards",
    },
    "285": {
      inputs: {
        vae_name: input.vae_name,
      },
      class_type: "VAEUtils_CustomVAELoader",
    },
    "286": {
      inputs: {
        upscale: input.vae_upscale,
        tile: input.vae_tile,
        tile_size: input.vae_tile_size,
        overlap: input.vae_overlap,
        temporal_size: 4096,
        temporal_overlap: 64,
        samples: ["118", 0],
        vae: ["303", 0],
      },
      class_type: "VAEUtils_VAEDecodeTiled",
    },
    "303": {
      inputs: {
        cond: ["319", 0],
        tt_value: ["285", 0],
        ff_value: ["304", 0],
      },
      class_type: "ImpactConditionalBranch",
    },
    "304": {
      inputs: {
        vae_name: input.vae_name,
      },
      class_type: "VAELoader",
    },
    "312": {
      inputs: {
        samples: ["118", 0],
        vae: ["303", 0],
      },
      class_type: "VAEDecode",
    },
    "318": {
      inputs: {
        cond: ["319", 0],
        tt_value: ["320", 0],
        ff_value: ["312", 0],
      },
      class_type: "ImpactConditionalBranch",
    },
    "319": {
      inputs: {
        value: input.use_vae_utils_loader,
      },
      class_type: "ImpactBoolean",
    },
    "320": {
      inputs: {
        upscale_method: "lanczos",
        scale_by: input.output_downscale,
        image: ["286", 0],
      },
      class_type: "ImageScaleBy",
    },
    "321": {
      inputs: {
        lora_count: 10,
        cpu_offload: input.lora_cpu_offload,
        lora_name_1: input.lora_1_name,
        lora_strength_1: input.lora_1_strength,
        lora_name_2: input.lora_2_name,
        lora_strength_2: input.lora_2_strength,
        lora_name_3: input.lora_3_name,
        lora_strength_3: input.lora_3_strength,
        lora_name_4: input.lora_4_name,
        lora_strength_4: input.lora_4_strength,
        lora_name_5: input.lora_5_name,
        lora_strength_5: input.lora_5_strength,
        lora_name_6: input.lora_6_name,
        lora_strength_6: input.lora_6_strength,
        lora_name_7: input.lora_7_name,
        lora_strength_7: input.lora_7_strength,
        lora_name_8: input.lora_8_name,
        lora_strength_8: input.lora_8_strength,
        lora_name_9: input.lora_9_name,
        lora_strength_9: input.lora_9_strength,
        lora_name_10: input.lora_10_name,
        lora_strength_10: input.lora_10_strength,
        model: ["37", 0],
      },
      class_type: "NunchakuQwenImageLoraStack",
    },
    "324": {
      inputs: {
        sub_text: "<sam>",
        case_insensitive: true,
        text: ["183", 0],
      },
      class_type: "Text Contains",
    },
    "325": {
      inputs: {
        cond: ["324", 0],
        tt_value: ["336", 0],
        ff_value: ["254", 0],
      },
      class_type: "ImpactConditionalBranch",
    },
    "327": {
      inputs: {
        prompt: input.sam_prompt,
        sam2_model: input.sam2_model,
        dino_model: input.dino_model,
        device: "Auto",
        threshold: input.sam_threshold,
        mask_blur: input.sam_mask_blur,
        mask_offset: input.sam_mask_offset,
        invert_output: input.sam_invert_output,
        background: "Color",
        background_color: input.sam_background_color,
        image: ["254", 0],
      },
      class_type: "SAM2Segment",
    },
    "331": {
      inputs: {
        sensitivity: input.mask_enhancer_sensitivity,
        mask_blur: input.mask_enhancer_blur,
        mask_offset: input.mask_enhancer_offset,
        smooth: input.mask_enhancer_smooth,
        fill_holes: input.mask_enhancer_fill_holes,
        invert_output: input.mask_enhancer_invert_output,
        mask: ["327", 1],
      },
      class_type: "AILab_MaskEnhancer",
    },
    "336": {
      inputs: {
        mask_opacity: 1,
        mask_color: input.sam_background_color,
        image: ["254", 0],
        mask: ["341", 0],
      },
      class_type: "AILab_MaskOverlay",
    },
    "340": {
      inputs: {
        erode_dilate: input.mask_fix_erode_dilate,
        fill_holes: input.mask_fix_fill_holes,
        remove_isolated_pixels: input.mask_fix_remove_isolated,
        smooth: input.mask_fix_smooth,
        blur: input.mask_fix_blur,
        mask: ["327", 1],
      },
      class_type: "MaskFix+",
    },
    "341": {
      inputs: {
        mode: "combine",
        mask_1: ["327", 1],
        mask_2: ["340", 0],
      },
      class_type: "AILab_MaskCombiner",
    },
  };
  return workflow;
}

const workflow: Workflow = {
  RequestSchema,
  generateWorkflow,
  summary: "Qwen Image Edit with SAM2, LoRA, and Advanced Masking",
  description:
    "Edits an image based on a text prompt using the Qwen model. This workflow integrates SAM2 for object segmentation, which can be refined with MaskFix+. It also supports a LoRA stack for style adjustments, optional background removal (RMBG), face restoration (ReActor), and upscaling, all controlled via tags in the prompt. A conditional VAE loader allows choosing between standard and tiled decoding for memory efficiency.",
};

export default workflow;
