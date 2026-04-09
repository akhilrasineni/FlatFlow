import React from 'react';
import Markdown from 'react-markdown';
import { Card } from '@/components/ui/card.tsx';
import { Button } from '@/components/ui/button.tsx';
import { FileText, CheckCircle2, PenTool, AlertCircle } from 'lucide-react';
import { Agreement, Property, UserProfile } from '@/types';

interface AgreementDocumentProps {
  agreement: Agreement;
  property: Property;
  ownerProfile?: UserProfile;
  tenantProfile?: UserProfile;
  onSign?: () => void;
  isSigning?: boolean;
  canSign?: boolean;
}

export function AgreementDocument({ 
  agreement, 
  property, 
  ownerProfile,
  tenantProfile,
  onSign, 
  isSigning,
  canSign 
}: AgreementDocumentProps) {
  // Robust name handling with profiles and fallbacks
  const ownerName = ownerProfile?.displayName || agreement.ownerName || "Owner";
  const tenantName = tenantProfile?.displayName || agreement.tenantName || "Tenant";
  
  const rentAmount = agreement.rent.toLocaleString('en-IN');
  const depositAmount = agreement.deposit.toLocaleString('en-IN');
  
  const startDate = new Date(agreement.startDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  const endDate = new Date(new Date(agreement.startDate).setMonth(new Date(agreement.startDate).getMonth() + 11)).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  const executionDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const sections = [
    {
      title: "PARTIES TO THE AGREEMENT",
      content: `This Rent Agreement is made and executed on this **${executionDate}**

### **BETWEEN**

**${ownerName.toUpperCase()}**, hereinafter referred to as the *“Owner”* (which expression shall, unless repugnant to the context, include his/her heirs, legal representatives, and assigns)

### **AND**

**${tenantName.toUpperCase()}**, hereinafter referred to as the *“Tenant”* (which expression shall, unless repugnant to the context, include his/her heirs, legal representatives, and assigns)`
    },
    {
      title: "PROPERTY DETAILS",
      content: `The Owner hereby lets out the property located at:
**${property.address}, ${property.area}, ${property.city}**
(hereinafter referred to as the “Premises”)`
    },
    {
      title: "TERM",
      content: `The tenancy shall be for a period of **11 months**, commencing from **${startDate}** and ending on **${endDate}**.`
    },
    {
      title: "RENT & DEPOSIT",
      content: `* **Monthly Rent:** The Tenant agrees to pay a monthly rent of **₹${rentAmount}** (Rupees __________________ only), payable in advance on or before the **5th** day of each month.

* **Security Deposit:** The Tenant has paid a refundable security deposit of **₹${depositAmount}** (Rupees __________________ only) to the Owner.

* The deposit shall be refunded at the end of the tenancy, subject to deductions for damages (if any).

* No interest shall be payable on the deposit.`
    },
    {
      title: "USE & MAINTENANCE",
      content: `* **Purpose:** The premises shall be used strictly for **residential purposes only**.

* **Repairs:** Minor repairs shall be borne by the Tenant. Major structural repairs shall be the responsibility of the Owner.

* **Condition:** The Tenant shall maintain the premises in good condition and shall not sublet or transfer the premises without prior written consent.`
    },
    {
      title: "UTILITIES & BILLS",
      content: `Charges for electricity, water, gas, internet, and other utilities shall be paid by the Tenant as per actual usage.`
    },
    {
      title: "TERMINATION & NOTICE",
      content: `* Either party may terminate this agreement by giving **30 days’ written notice**.

* In case of early termination, settlement of dues must be completed before vacating.`
    },
    {
      title: "LEGAL & GOVERNING LAW",
      content: `* This agreement shall be governed by the laws of India.

* The Tenant agrees to comply with all local laws and society rules.

* Any disputes shall be subject to jurisdiction of local courts.`
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-slate-100 min-h-screen">
      <Card className="bg-white shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border-none overflow-hidden relative">
        {/* Stamp Duty Header */}
        <div className="bg-[#fdf6e3] border-b-4 border-[#8b4513] p-8 text-center space-y-2 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#8b4513 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          <div className="border-2 border-[#8b4513] p-4 inline-block">
            <h1 className="text-3xl font-serif font-bold text-[#8b4513] tracking-widest uppercase">E-Stamp Certificate</h1>
            <p className="text-xs font-serif text-[#8b4513] mt-1">Government of India | Digital Rental Agreement</p>
          </div>
          <div className="flex justify-between text-[10px] font-mono text-[#8b4513] mt-4 uppercase tracking-tighter opacity-70">
            <span>Certificate No: IN-DL{agreement.id.slice(0, 8).toUpperCase()}</span>
            <span>Date: {executionDate}</span>
            <span>Amount: ₹500</span>
          </div>
        </div>

        <div className="p-12 md:p-20 space-y-16 font-serif relative">
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none rotate-[-45deg]">
            <span className="text-9xl font-bold uppercase tracking-[2rem]">Original</span>
          </div>

          <div className="text-center space-y-4 mb-16">
            <h1 className="text-4xl font-bold text-[#0F2A5F] underline underline-offset-8 decoration-2">RENT AGREEMENT</h1>
            <p className="text-slate-500 font-mono text-sm">Agreement ID: {agreement.id.toUpperCase()}</p>
          </div>

          <div className="space-y-16">
            {sections.map((section, idx) => (
              <div key={idx} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${idx * 100}ms` }}>
                <h2 className="text-xl font-bold text-[#0F2A5F] border-b-2 border-slate-100 pb-3 uppercase tracking-wider flex items-center gap-3">
                  <span className="bg-[#0F2A5F] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">{idx + 1}</span>
                  {section.title}
                </h2>
                <div className="prose prose-slate max-w-none prose-p:leading-loose prose-p:text-justify prose-p:text-lg prose-p:text-slate-700 prose-li:text-lg prose-li:text-slate-700 prose-li:my-4 prose-strong:text-[#0F2A5F]">
                  <Markdown>{section.content}</Markdown>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 pt-20 border-t-4 border-slate-100">
            <div className="space-y-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Owner Signature</p>
              <div className="h-40 border-2 border-slate-100 rounded-3xl flex items-center justify-center bg-slate-50/50 relative group transition-all hover:bg-white hover:border-blue-200 hover:shadow-xl">
                {agreement.ownerSigned ? (
                  <div className="flex flex-col items-center text-green-600 animate-in fade-in zoom-in duration-500">
                    <div className="bg-green-100 p-4 rounded-full mb-3 shadow-inner">
                      <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <p className="text-sm font-bold uppercase tracking-widest">Digitally Verified</p>
                    <p className="text-xs opacity-70 mt-1 font-mono">{ownerName}</p>
                    <div className="absolute bottom-4 right-4 opacity-10">
                      <FileText className="h-16 w-16" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-slate-300">
                    <PenTool className="h-10 w-10 mb-3 opacity-20" />
                    <p className="text-xs uppercase tracking-widest italic font-medium">Pending Signature</p>
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-slate-800">{ownerName}</p>
                <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Lessor / Owner</p>
              </div>
            </div>

            <div className="space-y-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Tenant Signature</p>
              <div className="h-40 border-2 border-slate-100 rounded-3xl flex items-center justify-center bg-slate-50/50 relative group transition-all hover:bg-white hover:border-blue-200 hover:shadow-xl">
                {agreement.tenantSigned ? (
                  <div className="flex flex-col items-center text-green-600 animate-in fade-in zoom-in duration-500">
                    <div className="bg-green-100 p-4 rounded-full mb-3 shadow-inner">
                      <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <p className="text-sm font-bold uppercase tracking-widest">Digitally Verified</p>
                    <p className="text-xs opacity-70 mt-1 font-mono">{tenantName}</p>
                    <div className="absolute bottom-4 right-4 opacity-10">
                      <FileText className="h-16 w-16" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-slate-300">
                    <PenTool className="h-10 w-10 mb-3 opacity-20" />
                    <p className="text-xs uppercase tracking-widest italic font-medium">Pending Signature</p>
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-slate-800">{tenantName}</p>
                <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Lessee / Tenant</p>
              </div>
            </div>
          </div>

          {canSign && (
            <div className="pt-20 flex flex-col items-center gap-6">
              <div className="flex items-center gap-3 text-amber-600 bg-amber-50 px-6 py-3 rounded-2xl text-sm font-medium border border-amber-100 shadow-sm">
                <AlertCircle className="h-5 w-5" />
                By signing, you agree to all terms and conditions listed above.
              </div>
              <Button 
                variant="gradient" 
                size="lg" 
                className="px-20 h-20 text-2xl font-bold rounded-3xl gap-4 shadow-[0_20px_50px_rgba(8,_112,_184,_0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                onClick={onSign}
                disabled={isSigning}
              >
                {isSigning ? (
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </div>
                ) : (
                  <>
                    <PenTool className="h-8 w-8" />
                    Sign Digitally
                  </>
                )}
              </Button>
              <p className="text-xs text-slate-400 text-center max-w-md leading-relaxed">
                This is a legally binding electronic signature under the Information Technology Act, 2000. 
                Your IP address and timestamp will be recorded for verification.
              </p>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="bg-slate-50 border-t p-8 flex justify-between items-center text-xs font-mono text-slate-400 uppercase tracking-widest">
          <span>Page 1 of 1</span>
          <span className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Blockchain Verified Agreement
          </span>
          <span>{agreement.id.toUpperCase()}</span>
        </div>
      </Card>
    </div>
  );
}

function Badge({ children, variant = 'default', className = '' }: { children: React.ReactNode, variant?: 'default' | 'secondary' | 'outline', className?: string }) {
  const variants = {
    default: 'bg-green-100 text-green-700 border-green-200',
    secondary: 'bg-blue-100 text-blue-700 border-blue-200',
    outline: 'border-slate-200 text-slate-600'
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
