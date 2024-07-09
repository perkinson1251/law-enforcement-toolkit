const statusDescriptions = [
  { status: "active", description: "Ситуация активна" },
  { status: "closed", description: "Ситуация завершена" },
];

export default function getStatusDescription(status: string): string {
  const statusObject = statusDescriptions.find((s) => s.status === status);
  return statusObject ? statusObject.description : "Неизвестный статус";
}
