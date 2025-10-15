import React from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UpgradePromptProps {
  feature: string;
  currentPlan: string;
  requiredPlan: string;
}

export function UpgradePrompt({ feature, currentPlan, requiredPlan }: UpgradePromptProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6 text-center">
      <Lock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        Upgrade to Access {feature}
      </h3>
      <p className="text-gray-600 mb-4">
        You're currently on the <strong>{currentPlan}</strong> plan.
        Upgrade to <strong>{requiredPlan}</strong> or higher to unlock this feature.
      </p>
      <button
        onClick={() => navigate('/pricing')}
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        View Plans & Upgrade
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

interface LimitReachedPromptProps {
  limitType: string;
  currentCount: number;
  maxCount: number;
  currentPlan: string;
}

export function LimitReachedPrompt({ limitType, currentCount, maxCount, currentPlan }: LimitReachedPromptProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <Lock className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Plan Limit Reached
          </h3>
          <p className="text-gray-700 mb-3">
            You've reached the maximum of <strong>{maxCount} {limitType}</strong> on your <strong>{currentPlan}</strong> plan ({currentCount}/{maxCount}).
          </p>
          <p className="text-gray-600 mb-4 text-sm">
            Upgrade to a higher plan to add more {limitType}.
          </p>
          <button
            onClick={() => navigate('/pricing')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
          >
            Upgrade Plan
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
