import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import React from 'react';

interface Props {

}

const SuccesPayement: React.FC<Props> = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="mb-6">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
                    <p className="text-gray-600">Thank you for your purchase. Your payment has been processed successfully.</p>
                </div>

                <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-800">
                            You will receive a confirmation email shortly with your receipt and order details.
                        </p>
                    </div>

                    <Button
                        className="w-full bg-black hover:bg-gray-800 text-white"
                        onClick={() => (window.location.href = "/")}
                    >
                        Go Home
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default SuccesPayement;
