import { Button } from '@/components/ui/button';
import { RefreshCw, XCircle } from 'lucide-react';
import React from 'react';

interface Props {

}

const Failedpayment: React.FC<Props> = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="mb-6">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
                    <p className="text-gray-600">We're sorry, but your payment could not be processed at this time.</p>
                </div>

                <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-800">
                            Please check your payment details and try again, or contact support if the problem persists.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Button className="w-full bg-black hover:bg-gray-900 text-white" onClick={() => (window.location.href = "/")}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Try Again
                        </Button>

                        <Button variant="outline" className="w-full" onClick={() => (window.location.href = "/")}>
                            Go Home
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Failedpayment;
