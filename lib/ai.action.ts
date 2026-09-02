// fetchAsDataUrl Was Implemented by AI, Prompt:
// Write a typescript function called
// fetchAsDataUrl in lib/ai.action.ts that
// takes a url string and returns a
// promise string. first use fetch to get
// hte image and throw an error if the
// response fails. then convert the
// response int a blob. and finally create a
// ne w promise that uses a file reader to
// read the blob as a data url and

import { puter } from "@heyputer/puter.js";
import { ROOMIFY_RENDER_PROMPT } from "./constants";

// resolves with a result or rejects on error
export const fetchAsDataUrl = async (url: string): Promise<string> => {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch image: ${response.statusText}`);
	}

	const blob = await response.blob();

	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => {
			if (typeof reader.result === "string") {
				resolve(reader.result);
			} else {
				reject(new Error("Failed to convert blob to data URL"));
			}
		};
		reader.onerror = () => {
			reject(new Error("Error reading blob as data URL"));
		};
		reader.readAsDataURL(blob);
	});
};
export const generate3DView = async ({ sourceImage }: Generate3DViewParams) => {
	const dataUrl = sourceImage.startsWith("data:")
		? sourceImage
		: await fetchAsDataUrl(sourceImage);
	const base64Data = dataUrl.split(",")[1];
	const mimeType = dataUrl.split(";")[0].split(":")[1];
	if (!mimeType || !base64Data) throw new Error("Invalid source image payload");
	const response = await puter.ai.txt2img(ROOMIFY_RENDER_PROMPT, {
		provider: "gemini",
		model: "gemini-2.5-flash-image-preview",
		input_image: base64Data,
		input_image_mime_type: mimeType,
		ratio: { w: 1024, h: 1024 },
	});
	const rawImageUrl = (response as HTMLImageElement).src ?? null;
	if (!rawImageUrl)
		return {
			renderedImage: null,
			renderedPath: undefined,
		};
	const renderedImage = rawImageUrl.startsWith("data:")
		? rawImageUrl
		: await fetchAsDataUrl(rawImageUrl);
	return { renderedImage, renderedPath: undefined };
};
