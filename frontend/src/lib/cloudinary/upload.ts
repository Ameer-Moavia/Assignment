export async function uploadToCloudinary(file: File) {
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/auto/upload`, {
    method: "POST",
    body: form
  });
  if (!res.ok) throw new Error("Cloudinary upload failed");
  return res.json() as Promise<{ secure_url: string; public_id: string; resource_type: string }>;
}
