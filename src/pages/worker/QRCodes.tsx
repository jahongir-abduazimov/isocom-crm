import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  QrCode,
  Download,
  Camera,
  AlertCircle,
} from "lucide-react";
import QRCode from "qrcode";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { toast } from "sonner";

export default function QRCodesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [textToGenerate, setTextToGenerate] = useState("");
  const [generatedQRCode, setGeneratedQRCode] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [scannedResult, setScannedResult] = useState<string>("");
  const [cameraPermission, setCameraPermission] = useState<
    "granted" | "denied" | "prompt"
  >("prompt");
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Check camera permission on component mount
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: "camera" as PermissionName })
        .then((result) => {
          setCameraPermission(result.state as "granted" | "denied" | "prompt");
        });
    }
  }, []);

  const generateQRCode = async () => {
    if (!textToGenerate.trim()) {
      toast.error(t("qr.generationError"));
      return;
    }

    setIsGenerating(true);
    try {
      const qrCodeDataURL = await QRCode.toDataURL(textToGenerate, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setGeneratedQRCode(qrCodeDataURL);
      toast.success(t("qr.generatedQR"));
    } catch (error) {
      console.error("QR Code generation error:", error);
      toast.error(t("qr.generationError"));
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!generatedQRCode) return;

    const link = document.createElement("a");
    link.download = "qr-code.png";
    link.href = generatedQRCode;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const startScanning = async () => {
    if (cameraPermission === "denied") {
      toast.error(t("qr.noCameraAccess"));
      return;
    }

    setScannedResult("");

    try {
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      };

      const scanner = new Html5QrcodeScanner("qr-reader", config, false);
      scannerRef.current = scanner;

      scanner.render(
        (decodedText) => {
          scanner.clear();
          scannerRef.current = null;
          handleScanResult(decodedText);
        },
        (error) => {
          // Don't show error for every failed scan attempt
          console.log("QR Code scan error:", error);
        }
      );
    } catch (error) {
      console.error("Scanner initialization error:", error);
      toast.error(t("qr.cameraError"));
    }
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
  };

  const closeScanModal = () => {
    stopScanning();
    setIsScanModalOpen(false);
    setScannedResult("");
  };

  const openScanModal = () => {
    setIsScanModalOpen(true);
  };

  // Auto-start scanner when modal opens
  useEffect(() => {
    if (isScanModalOpen && cameraPermission === 'granted') {
      // Small delay to ensure modal is fully rendered
      const timer = setTimeout(() => {
        startScanning();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isScanModalOpen, cameraPermission]);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      setCameraPermission("granted");
      toast.success(t("qr.cameraPermission"));
    } catch (error) {
      console.error("Camera permission error:", error);
      setCameraPermission("denied");
      toast.error(t("qr.noCameraAccess"));
    }
  };

  // Helper function to check if a string is a valid URL
  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Helper function to check if URL is internal (same domain) or external
  const isInternalUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname === window.location.hostname ||
        urlObj.hostname === 'localhost' ||
        urlObj.hostname === '127.0.0.1' ||
        url.startsWith('/'); // Relative path
    } catch (_) {
      // If it's not a full URL, treat as internal path
      return url.startsWith('/');
    }
  };

  // Helper function to handle navigation after scanning
  const handleScanResult = (scannedText: string) => {
    setScannedResult(scannedText);

    if (isValidUrl(scannedText)) {
      if (isInternalUrl(scannedText)) {
        // Internal URL - navigate within the app
        try {
          const url = new URL(scannedText, window.location.origin);
          const pathname = url.pathname + url.search + url.hash;
          navigate(pathname);
          toast.success(t("qr.scanSuccess"));
        } catch (_) {
          // If it's a relative path
          navigate(scannedText);
          toast.success(t("qr.scanSuccess"));
        }
      } else {
        // External URL - don't navigate automatically, just show result with warning
        toast.success(t("qr.scanSuccess"));
      }
    } else {
      // Not a URL - just display the result
      toast.success(t("qr.scanSuccess"));
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header with Scan Button */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{t("qr.title")}</h1>
          <Button
            onClick={openScanModal}
            className="flex items-center gap-2"
          >
            <Camera size={16} />
            {t("qr.scan")}
          </Button>
        </div>

        {/* QR Code Generation */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="text-input">{t("qr.textToGenerate")}</Label>
                <Input
                  id="text-input"
                  value={textToGenerate}
                  onChange={(e) => setTextToGenerate(e.target.value)}
                  placeholder={t("qr.enterText")}
                  className="mt-1"
                />
              </div>
              <Button
                onClick={generateQRCode}
                disabled={isGenerating || !textToGenerate.trim()}
                className="w-full sm:w-auto"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t("common.loading")}
                  </>
                ) : (
                  <>
                    <QrCode size={16} className="mr-2" />
                    {t("qr.generateQR")}
                  </>
                )}
              </Button>
            </div>
          </Card>

          {generatedQRCode && (
            <Card className="p-6">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold">{t("qr.generatedQR")}</h3>
                <div className="flex justify-center">
                  <img
                    src={generatedQRCode}
                    alt="Generated QR Code"
                    className="border border-gray-200 rounded-lg"
                  />
                </div>
                <Button
                  onClick={downloadQRCode}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <Download size={16} className="mr-2" />
                  {t("qr.downloadQR")}
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Scan Modal */}
      <Dialog open={isScanModalOpen} onOpenChange={closeScanModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera size={20} />
              {t("qr.scanQR")}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col justify-center">
            {cameraPermission === "denied" && (
              <Card className="p-4 border-red-200 bg-red-50">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">
                      {t("qr.noCameraAccess")}
                    </h3>
                    <p className="text-sm text-red-600 mt-1">
                      {t("qr.cameraPermissionDesc")}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {cameraPermission === "prompt" && (
              <Card className="p-4 border-yellow-200 bg-yellow-50">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">
                      {t("qr.cameraPermission")}
                    </h3>
                    <p className="text-sm text-yellow-600 mt-1">
                      {t("qr.cameraPermissionDesc")}
                    </p>
                    <div className="mt-3">
                      <Button
                        onClick={requestCameraPermission}
                        size="sm"
                        className="bg-yellow-600 hover:bg-yellow-700"
                      >
                        {t("qr.allowCamera")}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            <div className="space-y-4">
              <div id="qr-reader" className="w-full max-w-sm mx-auto"></div>
              {scannedResult && (
                <Card className="p-4 bg-green-50 border-green-200">
                  <h3 className="text-sm font-medium text-green-800 mb-2">
                    {t("qr.scannedResult")}
                  </h3>
                  {isValidUrl(scannedResult) ? (
                    <div className="space-y-2">
                      <p className="text-sm text-green-700 break-all">
                        {scannedResult}
                      </p>
                      {isInternalUrl(scannedResult) ? (
                        <p className="text-xs text-blue-600">
                          {t("qr.navigating")}
                        </p>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-yellow-800">
                              {t("qr.externalLinkWarning")}
                            </p>
                          </div>
                          <a
                            href={scannedResult}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 break-all underline font-medium bg-blue-50 px-3 py-2 rounded-md border border-blue-200 hover:bg-blue-100 transition-colors"
                          >
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            {t("qr.openExternalLink")}
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-green-700 break-all bg-white p-3 rounded border">
                        {scannedResult}
                      </p>
                      <p className="text-xs text-gray-600">
                        {t("qr.textResult")}
                      </p>
                    </div>
                  )}
                </Card>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
