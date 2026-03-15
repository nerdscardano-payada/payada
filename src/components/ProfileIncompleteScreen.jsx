import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProfileIncompleteScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="p-4 rounded-full bg-red-500/20 border border-red-500/50">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">
          Profile Incomplete
        </h1>

        <p className="text-slate-300 mb-8">
          You must configure your business information and Cardano address before you can use the app.
        </p>

        <div className="space-y-3 mb-8 text-left bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-slate-600 flex items-center justify-center mt-0.5 flex-shrink-0">
              <span className="text-xs text-slate-300">1</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Business Name</p>
              <p className="text-xs text-slate-400">Enter your business name</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-slate-600 flex items-center justify-center mt-0.5 flex-shrink-0">
              <span className="text-xs text-slate-300">2</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Cardano Address</p>
              <p className="text-xs text-slate-400">Add your receiving address</p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => navigate('/MerchantProfile')}
          size="lg"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
        >
          Setup Profile <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}