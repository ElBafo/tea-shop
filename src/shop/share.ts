export function imageFile(dataUrl: string): File {
  const encoded = dataUrl.split(',')[1];
  if (!encoded) throw new Error('Image could not be captured');
  const bytes = Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0));
  return new File([bytes], 'my-tea-shop.png', {type:'image/png'});
}

export function saveImage(file: File): void {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  document.body.append(link);
  link.click();
  link.remove();
  // Give mobile browsers time to consume the download URL.
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
