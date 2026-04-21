declare module "pdf-parse" {
  const pdfParse: (data: Buffer) => Promise<{ text: string; numpages: number; info: unknown }>;
  export default pdfParse;
}
