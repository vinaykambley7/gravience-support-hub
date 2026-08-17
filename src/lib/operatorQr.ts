import QRCode from "qrcode";

const OPERATOR_URL =
  import.meta.env["VITE_PUBLIC_OPERATOR_URL"] ||
  `${window.location.origin}/operator`;

export async function generateOperatorQr() {
  return QRCode.toDataURL(OPERATOR_URL, {
    width: 1200,
    margin: 4,
    errorCorrectionLevel: "H",
  });
}