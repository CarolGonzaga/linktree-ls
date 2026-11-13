import { client } from "./supabase";
export async function uploadImage(file: File): Promise<string> {
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  const extension = extensions[file.type];
  if (!extension || file.size === 0 || file.size > 5 * 1024 * 1024)
    throw new Error("Escolha uma imagem JPEG, PNG ou WebP de até 5 MB.");
  const api = client();
  const { data, error } = await api.auth.getUser();
  if (error || !data.user)
    throw new Error("Entre novamente para enviar imagens.");
  const path = `${data.user.id}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await api.storage
    .from("ls-linktree")
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
      cacheControl: "31536000",
    });
  if (uploadError) throw uploadError;
  return api.storage.from("ls-linktree").getPublicUrl(path).data.publicUrl;
}
