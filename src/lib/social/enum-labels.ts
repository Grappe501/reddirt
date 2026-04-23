/** Human labels for UPPER_SNAKE enums (Prisma) without importing every enum at call sites. */
export function socialEnumLabel(value: string): string {
  return value.replaceAll("_", " ");
}
