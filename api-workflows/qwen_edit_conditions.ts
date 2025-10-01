import { z } from "zod";
// This gets evaluated in the context of src/workflows, so imports must be relative to that directory
import { ComfyPrompt, Workflow } from "../types";
import config from "../config";

const RequestSchema = z.object({
  image: z
    .string()
    .describe("Input image for editing (URL or base64 encoded string)"),
  prompt: z
    .string()
    .default(
      "Replace the background to a dense, less-saturated rainforest, with tall towering trees. Maintain natural green hues, but desaturate them slightly to evoke a misty, primeval atmosphere, with faint shafts of sunlight piercing the canopy. Incorporate patches of moss, scattered ferns, and damp earth to ground the scene in realism. Apply a soft background lens blur to create a cinematic depth-of-field effect, keeping the foreground figures sharp while gently softening the rainforest backdrop to emphasize their prominence. Ensure the lighting remains diffused, with a cool, natural tone. Add subtle details like distant bird silhouettes or faint water droplets on leaves to make scene look realistic, while maintaining a cohesive composition. Photo taken by iphone.<restoreface>\n|\nPlace the foreground in a scene showing a dense, less-saturated forest, captured in a slightly muted, amateurish style typical of an iPhone photo. The greenery appears faded, with dull greens dominating the tall, slender trees that stretch unevenly toward a pale, overcast sky. Their leaves, though abundant, lack vibrancy, blending into a soft, washed-out canopy. In the foreground, a cluster of large, moss-covered boulders sits heavily, their grayish-brown surfaces blending with the earthy tones of the forest floor. Sparse undergrowth, with muted shades of green and hints of yellow, weaves around the rocks, adding a slightly chaotic yet natural feel. The lighting is flat, casting no sharp shadows, which gives the image a hazy, almost dreamlike quality. The perspective tilts slightly, as if the phone was held at an angle, adding to the unpolished charm. A few thin trunks lean awkwardly, their bark peeling in subtle, desaturated browns. The overall mood is calm yet wild, a quiet snapshot of nature untouched, though the photo’s amateur nature—soft focus and uneven exposure—lends it a raw, unrefined edge. It’s a moment frozen in time, imperfect yet evocative of a serene, forgotten wilderness. Keep foreground scale intact. Align foreground to original position and size. Don't resize foreground. <rmbg><restoreface><upscale>"
    )
    .describe(
      "The editing instructions for the image generation. Use tags like <rmbg>, <restoreface>, and <upscale> to enable those features."
    ),
  seed: z
    .number()
    .int()
    .default(() => Math.floor(Math.random() * 1000000000000000))
    .describe("Seed for random number generation"),
  steps: z.number().int().min(1).max(100).default(4).describe("Number of sampling steps"),
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
    .int()
    .default(3)
    .describe("Aura Flow model sampling shift value"),
  cfg_norm_strength: z
    .number()
    .default(1)
    .describe("Strength for CFG Normalization"),
  initial_upscale_method: z
    .string()
    .default("lanczos")
    .describe("Initial method to use for upscaling the image"),
  megapixels: z
    .number()
    .default(1)
    .describe("Total megapixels to scale the image to"),
  upscaler_model_name: z
    .string()
    .default("RealESRGAN_x4plus.safetensors")
    .describe("Name of the upscaler model to use"),
  rmbg_model: z
    .string()
    .default("INSPYRENET")
    .describe("Model to use for background removal"),
  rmbg_sensitivity: z
    .number()
    .default(1)
    .describe("Sensitivity of the background removal"),
  rmbg_process_res: z
    .number()
    .default(1024)
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
  codeformer_weight: z
    .number()
    .min(0)
    .max(1)
    .default(0.5)
    .describe("Weight of the CodeFormer model in face restoration"),
  lora_1_name: z
    .string()
    .default("Qwen-Image-Lightning-4steps-V2.0.safetensors")
    .describe("Name of the LoRA model to use"),
  lora_1_strength: z
    .number()
    .default(1)
    .describe("Strength of the LoRA model"),
  lora_2_name: z.string().default("None").describe("Name of the LoRA model to use"),
  lora_2_strength: z
    .number()
    .default(1)
    .describe("Strength of the LoRA model"),
  lora_3_name: z.string().default("None").describe("Name of the LoRA model to use"),
  lora_3_strength: z
    .number()
    .default(1)
    .describe("Strength of the LoRA model"),
  lora_4_name: z.string().default("None").describe("Name of the LoRA model to use"),
  lora_4_strength: z
    .number()
    .default(1)
    .describe("Strength of the LoRA model"),
  lora_5_name: z.string().default("None").describe("Name of the LoRA model to use"),
  lora_5_strength: z
    .number()
    .default(1)
    .describe("Strength of the LoRA model"),
  lora_6_name: z.string().default("None").describe("Name of the LoRA model to use"),
  lora_6_strength: z
    .number()
    .default(1)
    .describe("Strength of the LoRA model"),
  lora_7_name: z.string().default("None").describe("Name of the LoRA model to use"),
  lora_7_strength: z
    .number()
    .default(1)
    .describe("Strength of the LoRA model"),
  lora_8_name: z.string().default("None").describe("Name of the LoRA model to use"),
  lora_8_strength: z
    .number()
    .default(1)
    .describe("Strength of the LoRA model"),
  lora_9_name: z.string().default("None").describe("Name of the LoRA model to use"),
  lora_9_strength: z
    .number()
    .default(1)
    .describe("Strength of the LoRA model"),
  lora_10_name: z
    .string()
    .default("None")
    .describe("Name of the LoRA model to use"),
  lora_10_strength: z
    .number()
    .default(1)
    .describe("Strength of the LoRA model"),
  unet_name: z
    .string()
    .default("qwen_image_edit_2509_fp8_e4m3fn.safetensors")
    .describe("Name of the UNET model to load"),
  clip_name: z
    .string()
    .default("qwen_2.5_vl_7b_fp8_scaled.safetensors")
    .describe("Name of the CLIP model to load"),
  vae_name: z
    .string()
    .default("qwen_image_vae.safetensors")
    .describe("Name of the VAE model to load"),
});

type InputType = z.infer<typeof RequestSchema>;

function generateWorkflow(input: InputType): ComfyPrompt {
  return {
    "37": {
      inputs: {
        unet_name: input.unet_name,
        weight_dtype: "default",
      },
      class_type: "UNETLoader",
      _meta: {
        title: "Load Diffusion Model",
      },
    },
    "38": {
      inputs: {
        clip_name: input.clip_name,
        type: "qwen_image",
        device: "default",
      },
      class_type: "CLIPLoader",
      _meta: {
        title: "Load CLIP",
      },
    },
    "39": {
      inputs: {
        vae_name: input.vae_name,
      },
      class_type: "VAELoader",
      _meta: {
        title: "Load VAE",
      },
    },
    "66": {
      inputs: {
        shift: input.aura_flow_shift,
        model: ["117", 0],
      },
      class_type: "ModelSamplingAuraFlow",
      _meta: {
        title: "ModelSamplingAuraFlow",
      },
    },
    "75": {
      inputs: {
        strength: input.cfg_norm_strength,
        model: ["66", 0],
      },
      class_type: "CFGNorm",
      _meta: {
        title: "CFGNorm",
      },
    },
    "78": {
      inputs: {
        image: input.image,
      },
      class_type: "LoadImage",
      _meta: {
        title: "Load Image",
      },
    },
    "88": {
      inputs: {
        pixels: ["218", 0],
        vae: ["39", 0],
      },
      class_type: "VAEEncode",
      _meta: {
        title: "VAE Encode",
      },
    },
    "93": {
      inputs: {
        upscale_method: input.initial_upscale_method,
        megapixels: ["230", 0],
        image: ["78", 0],
      },
      class_type: "ImageScaleToTotalPixels",
      _meta: {
        title: "Scale Image to Total Pixels",
      },
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
      _meta: {
        title: "TooManyLoras",
      },
    },
    "118": {
      inputs: {
        seed: input.seed,
        steps: input.steps,
        cfg: input.cfg_scale,
        sampler_name: input.sampler_name,
        scheduler: input.scheduler,
        denoise: input.denoise,
        model: ["75", 0],
        positive: ["128", 0],
        negative: ["129", 0],
        latent_image: ["88", 0],
      },
      class_type: "KSampler",
      _meta: {
        title: "KSampler",
      },
    },
    "119": {
      inputs: {
        samples: ["118", 0],
        vae: ["39", 0],
      },
      class_type: "VAEDecode",
      _meta: {
        title: "VAE Decode",
      },
    },
    "120": {
      inputs: {
        filename_prefix: "ComfyUI",
        images: ["205", 0],
      },
      class_type: "SaveImage",
      _meta: {
        title: "Save Image",
      },
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
        image: ["223", 0],
      },
      class_type: "RMBG",
      _meta: {
        title: "Remove Background (RMBG)",
      },
    },
    "128": {
      inputs: {
        prompt: ["184", 0],
        clip: ["117", 1],
        vae: ["39", 0],
        image1: ["218", 0],
      },
      class_type: "TextEncodeQwenImageEditPlus",
      _meta: {
        title: "TextEncodeQwenImageEditPlus",
      },
    },
    "129": {
      inputs: {
        conditioning: ["128", 0],
      },
      class_type: "ConditioningZeroOut",
      _meta: {
        title: "ConditioningZeroOut",
      },
    },
    "148": {
      inputs: {
        width: ["151", 0],
        height: ["151", 1],
        batch_size: 1,
        color: 0,
      },
      class_type: "EmptyImage",
      _meta: {
        title: "EmptyImage",
      },
    },
    "151": {
      inputs: {
        image: ["223", 0],
      },
      class_type: "GetImageSize+",
      _meta: {
        title: "🔧 Get Image Size",
      },
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
      _meta: {
        title: "ImageCompositeMasked",
      },
    },
    "153": {
      inputs: {
        model_name: input.upscaler_model_name,
      },
      class_type: "UpscaleModelLoader",
      _meta: {
        title: "Load Upscale Model",
      },
    },
    "154": {
      inputs: {
        upscale_model: ["153", 0],
        image: ["233", 0],
      },
      class_type: "ImageUpscaleWithModel",
      _meta: {
        title: "Upscale Image (using Model)",
      },
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
        image: ["119", 0],
      },
      class_type: "ReActorRestoreFaceAdvanced",
      _meta: {
        title: "Restore Face Advanced 🌌 ReActor",
      },
    },
    "168": {
      inputs: {
        text: ["177", 0],
        delimiter: "|",
        start_index: 0,
        skip_every: 0,
        max_count: 8,
      },
      class_type: "TextSplitByDelimiter",
      _meta: {
        title: "Text Split By Delimiter",
      },
    },
    "177": {
      inputs: {
        text: input.prompt,
      },
      class_type: "Text Multiline",
      _meta: {
        title: "Text Multiline",
      },
    },
    "183": {
      inputs: {
        string: ["168", 0],
        regex_pattern: "[\\r\\n]",
        replace: "",
        case_insensitive: true,
        multiline: false,
        dotall: false,
        count: 0,
      },
      class_type: "RegexReplace",
      _meta: {
        title: "Regex Replace",
      },
    },
    "184": {
      inputs: {
        string: ["183", 0],
        regex_pattern: "\\<.*\\>",
        replace: "",
        case_insensitive: true,
        multiline: false,
        dotall: false,
        count: 0,
      },
      class_type: "RegexReplace",
      _meta: {
        title: "Regex Replace",
      },
    },
    "191": {
      inputs: {
        text: ["183", 0],
        sub_text: "<restoreface>",
        case_insensitive: true,
      },
      class_type: "Text Contains",
      _meta: {
        title: "Text Contains",
      },
    },
    "192": {
      inputs: {
        text: ["183", 0],
        sub_text: "<rmbg>",
        case_insensitive: true,
      },
      class_type: "Text Contains",
      _meta: {
        title: "Text Contains",
      },
    },
    "205": {
      inputs: {
        select: ["211", 0],
        sel_mode: false,
        input1: ["167", 0],
        input2: ["119", 0],
      },
      class_type: "ImpactSwitch",
      _meta: {
        title: "Switch (Any)",
      },
    },
    "211": {
      inputs: {
        boolean: ["191", 0],
        on_true: ["212", 0],
        on_false: ["213", 0],
      },
      class_type: "easy ifElse",
      _meta: {
        title: "If else",
      },
    },
    "212": {
      inputs: {
        value: 1,
      },
      class_type: "easy int",
      _meta: {
        title: "Int",
      },
    },
    "213": {
      inputs: {
        value: 2,
      },
      class_type: "easy int",
      _meta: {
        title: "Int",
      },
    },
    "215": {
      inputs: {
        boolean: ["192", 0],
        on_true: ["216", 0],
        on_false: ["217", 0],
      },
      class_type: "easy ifElse",
      _meta: {
        title: "If else",
      },
    },
    "216": {
      inputs: {
        value: 1,
      },
      class_type: "easy int",
      _meta: {
        title: "Int",
      },
    },
    "217": {
      inputs: {
        value: 2,
      },
      class_type: "easy int",
      _meta: {
        title: "Int",
      },
    },
    "218": {
      inputs: {
        select: ["215", 0],
        images1: ["152", 0],
        images2_opt: ["223", 0],
      },
      class_type: "ImageMaskSwitch",
      _meta: {
        title: "Switch (images, mask)",
      },
    },
    "219": {
      inputs: {
        text: ["183", 0],
        sub_text: "<upscale>",
        case_insensitive: true,
      },
      class_type: "Text Contains",
      _meta: {
        title: "Text Contains",
      },
    },
    "220": {
      inputs: {
        boolean: ["219", 0],
        on_true: ["221", 0],
        on_false: ["222", 0],
      },
      class_type: "easy ifElse",
      _meta: {
        title: "If else",
      },
    },
    "221": {
      inputs: {
        value: 1,
      },
      class_type: "easy int",
      _meta: {
        title: "Int",
      },
    },
    "222": {
      inputs: {
        value: 2,
      },
      class_type: "easy int",
      _meta: {
        title: "Int",
      },
    },
    "223": {
      inputs: {
        select: ["220", 0],
        images1: ["226", 0],
        images2_opt: ["93", 0],
      },
      class_type: "ImageMaskSwitch",
      _meta: {
        title: "Switch (images, mask)",
      },
    },
    "224": {
      inputs: {
        select: ["215", 0],
        images1: ["123", 0],
        images2_opt: ["223", 0],
      },
      class_type: "ImageMaskSwitch",
      _meta: {
        title: "Switch (images, mask)",
      },
    },
    "226": {
      inputs: {
        upscale_method: "lanczos",
        megapixels: ["230", 0],
        image: ["154", 0],
      },
      class_type: "ImageScaleToTotalPixels",
      _meta: {
        title: "Scale Image to Total Pixels",
      },
    },
    "227": {
      inputs: {
        image: ["78", 0],
      },
      class_type: "GetImageSize+",
      _meta: {
        title: "🔧 Get Image Size",
      },
    },
    "228": {
      inputs: {
        a: ["227", 0],
        b: ["227", 1],
        operation: "multiply",
      },
      class_type: "easy mathInt",
      _meta: {
        title: "Math Int",
      },
    },
    "230": {
      inputs: {
        value: input.megapixels,
      },
      class_type: "easy float",
      _meta: {
        title: "Float",
      },
    },
    "231": {
      inputs: {
        comparison: "a <= b",
        a: ["228", 0],
        b: ["238", 0],
      },
      class_type: "easy compare",
      _meta: {
        title: "Compare",
      },
    },
    "233": {
      inputs: {
        select: ["234", 0],
        images1: ["78", 0],
        images2_opt: ["93", 0],
      },
      class_type: "ImageMaskSwitch",
      _meta: {
        title: "Switch (images, mask)",
      },
    },
    "234": {
      inputs: {
        boolean: ["231", 0],
        on_true: ["235", 0],
        on_false: ["236", 0],
      },
      class_type: "easy ifElse",
      _meta: {
        title: "If else",
      },
    },
    "235": {
      inputs: {
        value: 1,
      },
      class_type: "easy int",
      _meta: {
        title: "Int",
      },
    },
    "236": {
      inputs: {
        value: 2,
      },
      class_type: "easy int",
      _meta: {
        title: "Int",
      },
    },
    "238": {
      inputs: {
        a: ["230", 0],
        b: 1000000,
        operation: "multiply",
      },
      class_type: "easy mathFloat",
      _meta: {
        title: "Math Float",
      },
    },
    "239": {
      inputs: {
        images: ["224", 0],
      },
      class_type: "PreviewImage",
      _meta: {
        title: "Preview Image",
      },
    },
  };
}

const workflow: Workflow = {
  RequestSchema,
  generateWorkflow,
  summary: "Qwen Image Edit with Conditional Operations",
  description:
    "Edits a provided image based on a text prompt using the Qwen model. The workflow supports conditional background removal, face restoration, and upscaling by including the tags <rmbg>, <restoreface>, and <upscale> in the prompt.",
};

export default workflow;
