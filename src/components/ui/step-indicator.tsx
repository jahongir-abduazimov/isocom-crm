import { CheckCircle } from "lucide-react";

interface StepIndicatorProps {
    currentStep: number;
    className?: string;
}

const steps = [
    { number: 1, label: "Buyurtma", key: "order" },
    { number: 2, label: "Qadam", key: "step" },
    { number: 3, label: "Material", key: "material" },
    { number: 4, label: "Tasdiqlash", key: "confirmation" },
];

export default function StepIndicator({ currentStep, className = "" }: StepIndicatorProps) {
    return (
        <div className={`flex justify-center ${className}`}>
            <div className="flex items-center space-x-4">
                {steps.map((step, index) => {
                    const isCompleted = currentStep > step.number;
                    const isCurrent = currentStep === step.number;

                    return (
                        <div key={step.key} className="flex items-center">
                            {/* Step Circle */}
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${isCompleted
                                    ? "bg-green-600 text-white"
                                    : isCurrent
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-300 text-gray-600"
                                    }`}
                            >
                                {isCompleted ? (
                                    <CheckCircle className="h-4 w-4" />
                                ) : (
                                    step.number
                                )}
                            </div>

                            {/* Step Label */}
                            <span
                                className={`ml-2 text-sm font-medium transition-colors ${isCompleted
                                    ? "text-green-600"
                                    : isCurrent
                                        ? "text-blue-600"
                                        : "text-gray-500"
                                    }`}
                            >
                                {step.label}
                            </span>

                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div
                                    className={`w-16 h-0.5 transition-colors ${isCompleted ? "bg-green-600" : "bg-gray-300"
                                        }`}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
