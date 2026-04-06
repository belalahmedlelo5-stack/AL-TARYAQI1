// ============================================
// COMMISSION CALCULATION SERVICE
// 5% from supplier + 5% from buyer
// ============================================

import { supabase } from '@/lib/supabase';

export interface CommissionBreakdown {
  // Input
  originalPrice: number;           // Supplier's offer price
  shippingFee: number;             // Admin-controlled shipping
  
  // Calculated
  platformFeeSupplier: number;     // 5% of original
  supplierReceives: number;        // original - 5%
  
  platformFeeBuyer: number;        // 5% of (original + supplier_fee)
  buyerPays: number;               // original + fees + shipping
  
  platformRevenue: number;         // Total commission (both 5%s)
}

export interface PlatformSettings {
  supplierCommissionRate: number;
  buyerCommissionRate: number;
  shippingFee: number;
}

/**
 * Get current platform commission settings
 */
export async function getCommissionSettings(): Promise<PlatformSettings> {
  const { data, error } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', 'commission_rates')
    .single();
  
  if (error) {
    console.error('Error fetching commission settings:', error);
    return {
      supplierCommissionRate: 0.05,
      buyerCommissionRate: 0.05,
      shippingFee: 0,
    };
  }
  
  const { data: shippingData } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', 'shipping_fee')
    .single();
  
  return {
    supplierCommissionRate: data?.value?.supplier || 0.05,
    buyerCommissionRate: data?.value?.buyer || 0.05,
    shippingFee: shippingData?.value?.amount || 0,
  };
}

/**
 * Calculate commission breakdown for an offer
 */
export function calculateCommission(
  originalPrice: number,
  settings: PlatformSettings
): CommissionBreakdown {
  // Supplier side: 5% commission
  const platformFeeSupplier = Math.round(originalPrice * settings.supplierCommissionRate * 100) / 100;
  const supplierReceives = Math.round((originalPrice - platformFeeSupplier) * 100) / 100;
  
  // Buyer side: 5% on (original + supplier fee)
  const subtotalForBuyerCommission = originalPrice + platformFeeSupplier;
  const platformFeeBuyer = Math.round(subtotalForBuyerCommission * settings.buyerCommissionRate * 100) / 100;
  
  // Total buyer pays
  const buyerPays = Math.round(
    (originalPrice + platformFeeSupplier + platformFeeBuyer + settings.shippingFee) * 100
  ) / 100;
  
  // Total platform revenue
  const platformRevenue = Math.round((platformFeeSupplier + platformFeeBuyer) * 100) / 100;
  
  return {
    originalPrice,
    shippingFee: settings.shippingFee,
    platformFeeSupplier,
    supplierReceives,
    platformFeeBuyer,
    buyerPays,
    platformRevenue,
  };
}

/**
 * Format price for display
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format price without currency symbol
 */
export function formatPriceShort(amount: number): string {
  return new Intl.NumberFormat('ar-EG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ============================================
// REACT HOOK FOR COMMISSION DISPLAY
// ============================================

import { useState, useEffect } from 'react';

export function useCommissionCalculator(originalPrice: number) {
  const [breakdown, setBreakdown] = useState<CommissionBreakdown | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const calculate = async () => {
      setIsLoading(true);
      const settings = await getCommissionSettings();
      const result = calculateCommission(originalPrice, settings);
      setBreakdown(result);
      setIsLoading(false);
    };
    
    if (originalPrice > 0) {
      calculate();
    }
  }, [originalPrice]);
  
  return {
    breakdown,
    isLoading,
    formatPrice,
    formatPriceShort,
  };
}

// ============================================
// COMMISSION DISPLAY COMPONENT
// ============================================

import React from 'react';

interface CommissionBreakdownProps {
  originalPrice: number;
  showDetails?: boolean;
  compact?: boolean;
}

export function CommissionBreakdownDisplay({ 
  originalPrice, 
  showDetails = true,
  compact = false 
}: CommissionBreakdownProps) {
  const { breakdown, isLoading } = useCommissionCalculator(originalPrice);
  
  if (isLoading || !breakdown) {
    return <div className="text-gray-400 text-sm">جاري الحساب...</div>;
  }
  
  if (compact) {
    return (
      <div className="text-sm">
        <span className="font-semibold">{formatPriceShort(breakdown.buyerPays)} ج</span>
        <span className="text-gray-400 mx-1">|</span>
        <span className="text-gray-500">شامل العمولة</span>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 rounded-lg p-4 text-sm">
      <div className="flex justify-between py-1">
        <span className="text-gray-600">السعر الأساسي:</span>
        <span>{formatPriceShort(breakdown.originalPrice)} ج</span>
      </div>
      
      {showDetails && (
        <>
          <div className="flex justify-between py-1 text-orange-600">
            <span>عمولة المنصة (من المورد):</span>
            <span>-{formatPriceShort(breakdown.platformFeeSupplier)} ج</span>
          </div>
          
          <div className="flex justify-between py-1 text-orange-600">
            <span>عمولة المنصة (من المشتري):</span>
            <span>+{formatPriceShort(breakdown.platformFeeBuyer)} ج</span>
          </div>
          
          {breakdown.shippingFee > 0 && (
            <div className="flex justify-between py-1">
              <span className="text-gray-600">رسوم الشحن:</span>
              <span>+{formatPriceShort(breakdown.shippingFee)} ج</span>
            </div>
          )}
          
          <div className="border-t border-gray-200 my-2 pt-2 flex justify-between font-semibold text-lg">
            <span>الإجمالي:</span>
            <span className="text-teal-600">{formatPriceShort(breakdown.buyerPays)} ج</span>
          </div>
        </>
      )}
      
      {!showDetails && (
        <div className="flex justify-between font-semibold">
          <span>الإجمالي شامل العمولة:</span>
          <span className="text-teal-600">{formatPriceShort(breakdown.buyerPays)} ج</span>
        </div>
      )}
    </div>
  );
}
