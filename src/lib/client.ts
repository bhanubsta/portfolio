import sanityClient from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

let client: any;

try {
  client = sanityClient({
    projectId: process.env.REACT_APP_SANITY_PROJECT_ID || "p9ocpe8v", // valid-looking fallback
    dataset: "production",
    useCdn: true,
    apiVersion: "2021-08-31",
  });
} catch (e) {
  console.error("Sanity client initialization failed:", e);
  client = { fetch: async () => [] }; // simple mock
}

export { client };

const builder = imageUrlBuilder(client);

export const urlFor = (source: SanityImageSource) => builder.image(source);
