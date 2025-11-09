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
    .describe("Second input image for Qwen context (URL or base64 encoded string)"),
  image_3: z
    .string()
    .default("")
    .describe("Third input image for Qwen context (URL or base64 encoded string)"),
  prompt: z
    .string()
    .default(
      "Replace the background to a dense, less-saturated {rainforest|bamboo forest|mountain forest}, with tall towering trees. Maintain natural green hues, but desaturate them slightly to evoke a misty, primeval atmosphere, with faint shafts of sunlight piercing the canopy. Incorporate patches of moss, scattered ferns, and damp earth to ground the scene in realism. Apply a soft background lens blur to create a cinematic depth-of-field effect, keeping the foreground figures sharp while gently softening the rainforest backdrop to emphasize their prominence. Ensure the lighting remains diffused, with a cool, natural tone. Add subtle details like distant bird silhouettes or faint water droplets on leaves to make scene look realistic, while maintaining a cohesive composition. Photo taken by iphone.\n---\nPlace the foreground in a scene showing a dense, less-saturated forest, captured in a slightly muted, amateurish style typical of an iPhone photo. The greenery appears faded, with dull greens dominating the tall, slender trees that stretch unevenly toward a pale, overcast sky. Their leaves, though abundant, lack vibrancy, blending into a soft, washed-out canopy. In the foreground, a cluster of large, moss-covered boulders sits heavily, their grayish-brown surfaces blending with the earthy tones of the forest floor. Sparse undergrowth, with muted shades of green and hints of yellow, weaves around the rocks, adding a slightly chaotic yet natural feel. The lighting is flat, casting no sharp shadows, which gives the image a hazy, almost dreamlike quality. The perspective tilts slightly, as if the phone was held at an angle, adding to the unpolished charm. A few thin trunks lean awkwardly, their bark peeling in subtle, desaturated browns. The overall mood is calm yet wild, a quiet snapshot of nature untouched, though the photo’s amateur nature—soft focus and uneven exposure—lends it a raw, unrefined edge. It’s a moment frozen in time, imperfect yet evocative of a serene, forgotten wilderness. Keep foreground scale intact. Align foreground to original position and size. Don't resize foreground. <rmbg><restoreface><upscale>"
    )
    .describe(
      "The editing instructions for the image generation. Use tags like <rmbg>, <restoreface>, and <upscale> to enable those features."
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
  face_restore_downscale: z
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
    .default("enable")
    .describe("indicates whether to offload certain computations to the CPU to save GPU memory."),
  num_blocks_on_gpu: z
    .number()
    .min(1)
    .max(200)
    .default(20)
    .describe("Increasing the value keeps more blocks in GPU memory, which minimizes offloading and can lead to faster generation times. "),
  use_pin_memory: z
    .string()
    .default("disable")
    .describe("Pinning memory can speed up data transfers to the GPU by pre-loading data into a special area of the CPU's memory."),
  clip_name: z
    .string()
    .default("qwen_2.5_vl_7b_fp8_scaled.safetensors")
    .describe("Name of the CLIP model to load"),
  vae_name: z
    .string()
    .default("Wan2.1_VAE_upscale2x_imageonly_real_v1.safetensors")
    .describe("Name of the VAE model to load"),
  vae_upscale: z.number().default(2).describe("VAE decode upscale factor"),
  vae_tile: z.boolean().default(false).describe("Enable tiled VAE decoding"),
  vae_tile_size: z
    .number()
    .default(512)
    .describe("Tile size for VAE decoding"),
  vae_overlap: z
    .number()
    .default(64)
    .describe("Tile overlap for VAE decoding"),
  lora_1_name: z
    .string()
    .default("None")
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
        model: ["117", 0],
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
        vae: ["285", 0],
      },
      class_type: "VAEEncode",
    },
    "117": {
      inputs: {
        lora_01: input.lora_1_name,
        strength_01: input.lora_1_strength,
        lora_02: input.lora_2_name,
        strength_02: input.lora_2_strength,
        lora_03: input.lora_3_name,
        strength_03: input.lora_3_strength,
        lora_04: input.lora_4_name,
        strength_04: input.lora_4_strength,
        lora_05: input.lora_5_name,
        strength_05: input.lora_5_strength,
        lora_06: input.lora_6_name,
        strength_06: input.lora_6_strength,
        lora_07: input.lora_7_name,
        strength_07: input.lora_7_strength,
        lora_08: input.lora_8_name,
        strength_08: input.lora_8_strength,
        lora_09: input.lora_9_name,
        strength_09: input.lora_9_strength,
        lora_10: input.lora_10_name,
        strength_10: input.lora_10_strength,
        model: ["37", 0],
        clip: ["38", 0],
      },
      class_type: "TooManyLoras",
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
        image: ["254", 0],
      },
      class_type: "RMBG",
    },
    "128": {
      inputs: {
        prompt: ["282", 0],
        clip: ["117", 1],
        vae: ["285", 0],
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
        image: ["254", 0],
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
        image: ["293", 0],
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
    "239": {
      inputs: {
        images: ["253", 0],
      },
      class_type: "PreviewImage",
    },
    "247": {
      inputs: {
        cond: ["191", 0],
        tt_value: ["167", 0],
        ff_value: ["293", 0],
      },
      class_type: "ImpactConditionalBranch",
    },
    "252": {
      inputs: {
        cond: ["192", 0],
        tt_value: ["152", 0],
        ff_value: ["254", 0],
      },
      class_type: "ImpactConditionalBranch",
    },
    "253": {
      inputs: {
        cond: ["192", 0],
        tt_value: ["123", 0],
        ff_value: ["254", 0],
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
        vae: ["285", 0],
      },
      class_type: "VAEUtils_VAEDecodeTiled",
    },
    "293": {
      inputs: {
        scale_by: input.face_restore_downscale,
        images: ["286", 0],
      },
      class_type: "easy imageScaleDownBy",
    },
  };
  return workflow;
}

const workflow: Workflow = {
  RequestSchema,
  generateWorkflow,
  summary: "Qwen Image Edit with Conditional Operations",
  description:
    "Edits a provided image based on a text prompt using the Qwen model. The workflow supports conditional background removal, face restoration, and upscaling by including the tags <rmbg>, <restoreface>, and <upscale> in the prompt. It also supports wildcard replacements in the prompt (e.g., {option1|option2}).",
};

export default workflow;
