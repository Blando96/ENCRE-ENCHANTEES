import React, { useState } from 'react';
import { UserProfile, isPromoteurEmail } from '../types';
import { CINESCRYPTE_LOGO_URL } from '../assets/logo';
import {
  Zap,
  CheckCircle2,
  Sparkles,
  CreditCard,
  ShieldCheck,
  Star,
  Check,
  X,
  HelpCircle,
  Film,
  Crown,
  ArrowRight,
  Flame,
  Award,
  Layers,
  Lock,
  RefreshCw,
  Gift,
  Smartphone,
  Ticket
} from 'lucide-react';

interface SubscriptionPlansProps {
  user: UserProfile | null;
  onUpdateUserPlan?: (newPlanName: string, creditsAdded?: number) => void;
  onOpenAuthModal?: () => void;
  setActiveTab?: (tab: any) => void;
}

export interface PlanTier {
  id: string;
  name: string;
  badge?: string;
  tagline: string;
  monthlyPrice: number;
  annualPricePerMonth: number; // monthly equivalent when billed annually
  credits: number;
  resolution: string;
  popular?: boolean;
  color: string;
  borderAccent: string;
  bgGradient: string;
  features: { text: string; included: boolean; highlight?: boolean }[];
  ctaText: string;
}

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  user,
  onUpdateUserPlan,
  onOpenAuthModal,
  setActiveTab
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<PlanTier | null>(null);
  const [paymentStep, setPaymentStep] = useState<'review' | 'method' | 'success'>('review');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple' | 'google' | 'mobile_money' | 'promo_code'>('mobile_money');
  const [mobileProvider, setMobileProvider] = useState<'mtn' | 'orange' | 'moov' | 'wave'>('mtn');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoSuccess, setPromoSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const isPromoteur = isPromoteurEmail(user?.email);

  const plans: PlanTier[] = [
    {
      id: 'free',
      name: 'Gratuit / Découverte',
      tagline: 'Pour tester la conversion de textes courts en vidéo',
      monthlyPrice: 0,
      annualPricePerMonth: 0,
      credits: 500,
      resolution: '720p HD',
      color: 'text-slate-300',
      borderAccent: 'border-slate-800',
      bgGradient: 'from-slate-900/60 via-slate-900/40 to-slate-950/80',
      ctaText: 'Activer Découverte (0€)',
      features: [
        { text: '500 Crédits IA / mois', included: true },
        { text: 'Rendu Vidéo HD 720p', included: true },
        { text: '1 Roman ou Scénario simultané', included: true },
        { text: 'Ancrage de visage simple (1 angle)', included: true },
        { text: 'Musique & SFX de base', included: true },
        { text: 'Filigrane Discret', included: true },
      ]
    },
    {
      id: 'creator',
      name: 'Creator Studio',
      badge: isPromoteur ? 'VIP PROMOTEUR (0€)' : 'Populaire',
      popular: true,
      tagline: 'Pour auteurs, vidéastes et créateurs de séries web',
      monthlyPrice: isPromoteur ? 0 : 29,
      annualPricePerMonth: isPromoteur ? 0 : 23,
      credits: isPromoteur ? 10000 : 2500,
      resolution: '1080p Full HD',
      color: 'text-amber-400',
      borderAccent: 'border-amber-500/60 ring-2 ring-amber-500/20',
      bgGradient: 'from-amber-950/30 via-slate-900/90 to-slate-950/90',
      ctaText: isPromoteur ? 'Activer Creator Studio (0€ VIP)' : 'S\'abonner à Creator Studio',
      features: [
        { text: isPromoteur ? '10 000 Crédits IA / mois' : '2 500 Crédits IA / mois', included: true, highlight: true },
        { text: 'Rendu Vidéo Full HD 1080p (60fps)', included: true, highlight: true },
        { text: 'Romans & Scénarios Illimités', included: true },
        { text: 'Cohérence Visuelle 360° (5 angles visage)', included: true, highlight: true },
        { text: 'Sans Aucun Filigrane', included: true, highlight: true },
        { text: 'Voix Synthétiques Multilingues Studio', included: true },
        { text: 'Exportation MP4 & Sous-titres SRT', included: true },
        { text: 'Traitement GPU Accéléré', included: true },
      ]
    },
    {
      id: 'pro_4k',
      name: 'Studio Pro 4K',
      badge: isPromoteur ? 'VIP PROMOTEUR (0€)' : 'Recommandé Cinéma',
      popular: true,
      tagline: 'Pour réalisateurs, studios indépendants et maisons d\'édition',
      monthlyPrice: isPromoteur ? 0 : 79,
      annualPricePerMonth: isPromoteur ? 0 : 63,
      credits: isPromoteur ? 25000 : 7500,
      resolution: '4K Ultra HD',
      color: 'text-emerald-400',
      borderAccent: 'border-emerald-500/60 ring-2 ring-emerald-500/20',
      bgGradient: 'from-emerald-950/20 via-slate-900/90 to-slate-950/90',
      ctaText: isPromoteur ? 'Activer Studio Pro 4K (0€ VIP)' : 'Passer à Studio Pro 4K',
      features: [
        { text: isPromoteur ? '25 000 Crédits IA / mois' : '7 500 Crédits IA / mois', included: true, highlight: true },
        { text: 'Rendu Ultra-HD 4K Cinema Master 60fps', included: true, highlight: true },
        { text: 'Verrouillage Cohérence Multi-Personnages', included: true, highlight: true },
        { text: 'Génération Découpée Plan par Plan (Shots)', included: true, highlight: true },
        { text: 'Exportation Multi-pistes Timeline (ProRes)', included: true, highlight: true },
        { text: 'Génération Audio Bruitages & Musique IA', included: true },
        { text: 'Licence Commerciale Cinéma & VOD Complète', included: true },
        { text: 'Support Dédié & File d\'attente Ultra-Prioritaire', included: true },
      ]
    },
    {
      id: 'enterprise',
      name: 'Écurie Production',
      badge: isPromoteur ? 'SUR-MESURE OFFERT' : 'Sur-Mesure',
      tagline: 'Pour grands studios de cinéma, TV et agences médias',
      monthlyPrice: isPromoteur ? 0 : 249,
      annualPricePerMonth: isPromoteur ? 0 : 199,
      credits: 50000,
      resolution: '8K / 4K Lossless',
      color: 'text-purple-400',
      borderAccent: 'border-purple-500/40',
      bgGradient: 'from-purple-950/20 via-slate-900/90 to-slate-950/90',
      ctaText: isPromoteur ? 'Activer Écurie Production (0€ VIP)' : 'Contacter l\'Équipe Studio',
      features: [
        { text: '50 000 Crédits IA / mois & Serveur Dédié', included: true, highlight: true },
        { text: 'Rendu 4K / 8K Cinema Uncompressed', included: true },
        { text: 'Modèles IA Personnalisés LoRA (Visages réels)', included: true, highlight: true },
        { text: 'Accès API Direct CINESCRYPTE IA', included: true, highlight: true },
        { text: 'Multi-Utilisateurs (5 Sièges Réalisateurs)', included: true },
        { text: 'Conseiller Cinéma Dédié 24/7', included: true },
        { text: 'Contrats Droits d\'Auteur & Assurance IA', included: true },
      ]
    }
  ];


  const handleSelectPlan = (plan: PlanTier) => {
    if (!user) {
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }
    setSelectedPlanForCheckout(plan);
    setPaymentStep('review');
  };

  const handleConfirmSubscription = () => {
    if (!selectedPlanForCheckout) return;
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setPaymentStep('success');

      // Update user plan
      if (onUpdateUserPlan) {
        onUpdateUserPlan(
          selectedPlanForCheckout.name + (billingCycle === 'annual' ? ' (Annuel)' : ' (Mensuel)'),
          selectedPlanForCheckout.credits
        );
      }
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-16">
      
      {/* Header Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold shadow-lg">
          <Crown className="w-4 h-4 text-amber-400" />
          <span>Formules d'Abonnement CINESCRYPTE IA</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-serif font-black tracking-tight text-slate-100">
          Transformez vos livres en <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent">Films Cinéma 4K</span>
        </h1>

        <p className="text-sm md:text-base text-slate-300 leading-relaxed font-sans">
          Choisissez la puissance de génération IA adaptée à vos ambitions cinématographiques. Débloquez la résolution 4K, le verrouillage de cohérence visuelle des personnages et l'exportation multi-pistes sans filigrane.
        </p>

        {/* Monthly / Annual Toggle Switch */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <span className={`text-xs font-bold transition-all ${billingCycle === 'monthly' ? 'text-amber-300 scale-105' : 'text-slate-400'}`}>
            Facturation Mensuelle
          </span>

          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
            className="relative w-16 h-8 rounded-full bg-slate-900 border border-amber-500/40 p-1 transition-colors focus:outline-none shadow-inner"
          >
            <div
              className={`w-6 h-6 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 shadow-md transform transition-transform ${
                billingCycle === 'annual' ? 'translate-x-8' : 'translate-x-0'
              }`}
            />
          </button>

          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-bold transition-all ${billingCycle === 'annual' ? 'text-amber-300 scale-105' : 'text-slate-400'}`}>
              Facturation Annuelle
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30 flex items-center gap-1 animate-pulse">
              <Gift className="w-3 h-3 text-emerald-400" />
              -20% (2 Mois Offerts)
            </span>
          </div>
        </div>
      </div>

      {/* User Current Plan Status Banner (if logged in) */}
      {user && (
        <div className="space-y-4">
          {isPromoteur && (
            <div className="bg-gradient-to-r from-amber-500/20 via-amber-600/10 to-amber-950/40 p-5 rounded-3xl border border-amber-500/60 shadow-xl flex items-center gap-4 text-amber-200 text-xs animate-in fade-in">
              <Crown className="w-8 h-8 text-amber-400 shrink-0" />
              <div>
                <h4 className="font-serif font-bold text-sm text-amber-300 flex items-center gap-2">
                  <span>Accès Promoteur Reconnu ({user.email})</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-mono font-bold text-[10px] uppercase">
                    100% Gratuit Privilégié
                  </span>
                </h4>
                <p className="text-slate-300 mt-1">
                  En tant que Promoteur de la plateforme, l'intégralité des fonctionnalités et formules d'abonnement (Creator Studio, Studio Pro 4K, Écurie Production) vous est offerte à 0 € avec solde de crédits maximal.
                </p>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/20 p-5 rounded-3xl border border-amber-500/30 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-950 p-0.5 border border-amber-500/40 shadow-md shrink-0 overflow-hidden">
                <img
                  src={CINESCRYPTE_LOGO_URL}
                  alt="CINESCRYPTE Logo"
                  className="w-full h-full object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono">Statut du Compte :</span>
                  <span className="text-xs font-serif font-bold text-amber-300">{user.plan || 'Studio Pro 4K'}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30">
                    Actif
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Connecté en tant que <strong className="text-slate-100">{user.name}</strong> ({user.email})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-slate-800">
              <Zap className="w-5 h-5 text-amber-400" />
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Solde de Crédits IA</p>
                <p className="text-sm font-bold font-mono text-amber-400">
                  {isPromoteur ? '50,000 / 50,000 Crédits (VIP)' : '2,550 / 5,000 Crédits'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = user?.plan?.toLowerCase().includes(plan.id) || (plan.id === 'pro_4k' && user?.plan?.includes('Studio Pro 4K'));
          const displayPrice = billingCycle === 'annual' ? plan.annualPricePerMonth : plan.monthlyPrice;

          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-6 bg-gradient-to-b ${plan.bgGradient} border ${plan.borderAccent} shadow-2xl flex flex-col justify-between transition-all hover:scale-[1.02] duration-200`}
            >
              {/* Popular / Recommended Badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] uppercase tracking-wider shadow-lg shadow-amber-500/30 flex items-center gap-1 whitespace-nowrap">
                  <Flame className="w-3.5 h-3.5 fill-current text-slate-950" />
                  <span>{plan.badge}</span>
                </div>
              )}

              <div className="space-y-5">
                {/* Plan Header */}
                <div className="space-y-2 border-b border-slate-800/80 pb-4">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-serif font-bold text-lg ${plan.color}`}>{plan.name}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                      {plan.resolution}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-snug min-h-[32px]">{plan.tagline}</p>
                </div>

                {/* Price Display */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl md:text-4xl font-serif font-black text-slate-100">
                      {displayPrice === 0 ? 'Gratuit' : `${displayPrice}€`}
                    </span>
                    {displayPrice > 0 && (
                      <span className="text-xs text-slate-400 font-mono">/ mois</span>
                    )}
                  </div>
                  {billingCycle === 'annual' && displayPrice > 0 && (
                    <p className="text-[10px] text-emerald-400 font-mono">
                      Facturé {displayPrice * 12}€ / an (-20% inclus)
                    </p>
                  )}
                  {billingCycle === 'monthly' && displayPrice > 0 && (
                    <p className="text-[10px] text-slate-500 font-mono">
                      Facturé mensuellement
                    </p>
                  )}
                </div>

                {/* Credits Pill */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-200 font-mono">{plan.credits.toLocaleString()} Crédits IA / mois</p>
                    <p className="text-[10px] text-slate-400">Recharge automatique mensuelle</p>
                  </div>
                </div>

                {/* Feature List */}
                <div className="space-y-2.5 pt-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Inclus dans la formule :</p>
                  <ul className="space-y-2 text-xs">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        {feat.included ? (
                          <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${feat.highlight ? 'text-amber-400' : 'text-emerald-400'}`} />
                        ) : (
                          <X className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                        )}
                        <span className={feat.included ? (feat.highlight ? 'text-amber-200 font-medium' : 'text-slate-300') : 'text-slate-500 line-through'}>
                          {feat.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Call To Action Button */}
              <div className="pt-6">
                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isCurrentPlan}
                  className={`w-full py-3 px-4 rounded-2xl font-bold text-xs transition-all shadow-lg flex items-center justify-center gap-2 ${
                    isCurrentPlan
                      ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-amber-500/25 font-black'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700'
                  }`}
                >
                  {isCurrentPlan ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Formule Actuelle</span>
                    </>
                  ) : (
                    <>
                      <span>{plan.ctaText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Feature Comparison Matrix */}
      <div className="bg-slate-900/80 p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <h2 className="text-xl font-serif font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <span>Matrice Comparative Détaillée des Fonctionnalités</span>
            </h2>
            <p className="text-xs text-slate-400">
              Comparez les spécifications techniques de rendu vidéo, de gestion de la cohérence et de voix synthétiques.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="py-3 px-4 w-1/3">Fonctionnalité Studio</th>
                <th className="py-3 px-2 text-center">Gratuit</th>
                <th className="py-3 px-2 text-center text-amber-400 font-bold">Creator</th>
                <th className="py-3 px-2 text-center text-emerald-400 font-bold">Studio Pro 4K</th>
                <th className="py-3 px-2 text-center text-purple-400 font-bold">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr>
                <td className="py-3.5 px-4 font-medium text-slate-200">Résolution Maximale de Rendu</td>
                <td className="text-center font-mono text-slate-400">720p HD</td>
                <td className="text-center font-mono text-amber-300 font-bold">1080p Full HD</td>
                <td className="text-center font-mono text-emerald-400 font-bold">4K Ultra HD Cinema</td>
                <td className="text-center font-mono text-purple-400 font-bold">8K Lossless Master</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-medium text-slate-200">Angles de Visage Verrouillés (Coherence Guard)</td>
                <td className="text-center font-mono">1 angle</td>
                <td className="text-center font-mono text-amber-300">5 angles (360°)</td>
                <td className="text-center font-mono text-emerald-400 font-bold">Multi-Personnages Illimités</td>
                <td className="text-center font-mono text-purple-400 font-bold">Modèles LoRA Sur Mesure</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-medium text-slate-200">Génération par Séquence & Shots</td>
                <td className="text-center"><X className="w-4 h-4 mx-auto text-slate-600" /></td>
                <td className="text-center"><Check className="w-4 h-4 mx-auto text-amber-400" /></td>
                <td className="text-center"><Check className="w-4 h-4 mx-auto text-emerald-400" /></td>
                <td className="text-center"><Check className="w-4 h-4 mx-auto text-purple-400" /></td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-medium text-slate-200">Génération Voix Off Multilingues & SFX IA</td>
                <td className="text-center font-mono text-slate-400">Basique</td>
                <td className="text-center font-mono text-amber-300">Studio Pro (12 voix)</td>
                <td className="text-center font-mono text-emerald-400 font-bold">Ultra-Realistic Neural (50+ voix)</td>
                <td className="text-center font-mono text-purple-400 font-bold">Clonage de Voix Illimité</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-medium text-slate-200">Exportation Timeline Multi-Pistes (ProRes / MP4)</td>
                <td className="text-center"><X className="w-4 h-4 mx-auto text-slate-600" /></td>
                <td className="text-center font-mono text-slate-400">MP4 Unique</td>
                <td className="text-center"><Check className="w-4 h-4 mx-auto text-emerald-400" /></td>
                <td className="text-center"><Check className="w-4 h-4 mx-auto text-purple-400" /></td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-medium text-slate-200">Licence Commerciale & Droits d'Auteur</td>
                <td className="text-center text-slate-500">Usage Personnel</td>
                <td className="text-center text-slate-300">Monétisation Web</td>
                <td className="text-center text-emerald-300 font-bold">Cinéma, VOD & TV</td>
                <td className="text-center text-purple-300 font-bold">Transfert Total des Droits</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Frequently Asked Questions (FAQ) */}
      <div className="bg-slate-900/80 p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
        <div className="space-y-1">
          <h2 className="text-xl font-serif font-bold text-slate-100 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <span>Foire Aux Questions — Abonnements & Crédits IA</span>
          </h2>
          <p className="text-xs text-slate-400">
            Toutes les réponses pour comprendre le fonctionnement de CINESCRYPTE IA.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <h3 className="font-serif font-bold text-sm text-amber-300">Comment fonctionnent les Crédits IA ?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Chaque génération d'image de décor, de visage de personnage ou de séquence vidéo consomme un quota de crédits. Par exemple, une image 4K consomme 5 crédits et un plan vidéo HD consomme 15 crédits. Vos crédits sont renouvelés chaque mois.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <h3 className="font-serif font-bold text-sm text-amber-300">Puis-je changer ou annuler mon abonnement à tout moment ?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Oui, vous pouvez passer d'un plan à un autre ou résilier votre abonnement sans aucun frais directement depuis les paramètres de votre compte CINESCRYPTE IA. Votre accès reste valide jusqu'à la fin de la période payée.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <h3 className="font-serif font-bold text-sm text-amber-300">Comment fonctionne la cohérence visuelle des personnages ?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Notre module exclusif <strong>Coherence Guard</strong> crée un modèle d'ancrage génétique 360° pour chaque personnage extrait du roman. Cela garantit que le même visage, les mêmes yeux et les mêmes vêtements apparaissent identiques d'une scène à l'autre.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <h3 className="font-serif font-bold text-sm text-amber-300">Suis-je propriétaire des films générés ?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Absolument. Dès la formule <strong>Creator Studio</strong> et supérieure, vous détenez la pleine licence commerciale sur toutes les images, pistes audio et vidéos produites pour la diffusion en salle, sur YouTube, TikTok ou les plateformes de streaming.
            </p>
          </div>
        </div>
      </div>

      {/* Checkout Modal / Drawer */}
      {selectedPlanForCheckout && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-950 p-0.5 border border-amber-500/40 shadow-md">
                  <img src={CINESCRYPTE_LOGO_URL} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-slate-100">Validation de l'Abonnement</h3>
                  <p className="text-xs text-slate-400">Passage au plan {selectedPlanForCheckout.name}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPlanForCheckout(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
              >
                ✕
              </button>
            </div>

            {paymentStep === 'review' && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Formule choisie :</span>
                    <span className="font-bold text-amber-300">{selectedPlanForCheckout.name}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Cycle de facturation :</span>
                    <span className="font-mono text-slate-200">{billingCycle === 'annual' ? 'Annuel (-20% déduit)' : 'Mensuel'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Crédits IA Mensuels :</span>
                    <span className="font-mono text-amber-400 font-bold">+{selectedPlanForCheckout.credits.toLocaleString()} Crédits</span>
                  </div>
                  <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-bold">
                    <span className="text-slate-100">Total à régler aujourd'hui :</span>
                    <span className="text-emerald-400 font-mono text-base font-black">
                      {isPromoteur ? (
                        '0€ (Offert au Promoteur VIP)'
                      ) : (
                        billingCycle === 'annual'
                          ? `${selectedPlanForCheckout.annualPricePerMonth * 12}€ / an`
                          : `${selectedPlanForCheckout.monthlyPrice}€ / mois`
                      )}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Choisissez votre mode de paiement :</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">Sans Carte Visa disponible !</span>
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('mobile_money')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === 'mobile_money'
                          ? 'bg-amber-500/10 border-amber-500 text-amber-300 shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Smartphone className="w-4 h-4 text-amber-400" />
                      <span>Mobile Money</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('promo_code')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === 'promo_code'
                          ? 'bg-amber-500/10 border-amber-500 text-amber-300 shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Ticket className="w-4 h-4 text-emerald-400" />
                      <span>Code / Coupon</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === 'card'
                          ? 'bg-amber-500/10 border-amber-500 text-amber-300 shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Carte Bleue</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('apple')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === 'apple' || paymentMethod === 'google'
                          ? 'bg-amber-500/10 border-amber-500 text-amber-300 shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <AppleIcon className="w-4 h-4" />
                      <span>Apple / Google</span>
                    </button>
                  </div>

                  {/* MOBILE MONEY DETAILS */}
                  {paymentMethod === 'mobile_money' && (
                    <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-300">Opérateur Mobile Money :</span>
                        <span className="text-[10px] text-slate-400">Paiement instantané sans CB</span>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: 'mtn', name: 'MTN MoMo', color: 'bg-yellow-500 text-slate-950' },
                          { id: 'orange', name: 'Orange', color: 'bg-orange-500 text-white' },
                          { id: 'moov', name: 'Moov', color: 'bg-blue-600 text-white' },
                          { id: 'wave', name: 'Wave', color: 'bg-cyan-500 text-slate-950' },
                        ].map((op) => (
                          <button
                            key={op.id}
                            type="button"
                            onClick={() => setMobileProvider(op.id as any)}
                            className={`py-2 px-1 rounded-lg text-[11px] font-bold transition-all border ${
                              mobileProvider === op.id
                                ? 'border-amber-400 ring-2 ring-amber-500/30 font-black'
                                : 'border-slate-800 bg-slate-900 text-slate-400'
                            }`}
                          >
                            <span className={`px-1.5 py-0.5 rounded text-[9px] block ${op.color}`}>{op.name}</span>
                          </button>
                        ))}
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">
                          Numéro de Téléphone Mobile Money :
                        </label>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="ex: +229 97 00 00 00 ou 06 00 00 00"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {/* PROMO CODE / COUPON DETAILS */}
                  {paymentMethod === 'promo_code' && (
                    <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-300">Code Promo / Voucher VIP :</span>
                        <span className="text-[10px] text-emerald-400 font-mono">100% Réduction (0€)</span>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => {
                            setPromoCode(e.target.value);
                            setPromoSuccess(false);
                          }}
                          placeholder="Entrez votre code (ex: PROMOTEUR, VIP2026, GRATUIT)"
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 uppercase font-mono font-bold tracking-wider"
                        />
                        <button
                          type="button"
                          onClick={() => setPromoSuccess(true)}
                          className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
                        >
                          Appliquer
                        </button>
                      </div>

                      {promoSuccess && (
                        <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 text-[11px] font-bold flex items-center gap-1.5 border border-emerald-500/30">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Code activé ! Remise de 100% appliquée. Total : 0 €</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleConfirmSubscription}
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Traitement de l'Abonnement...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Confirmer & Activer {selectedPlanForCheckout.name}</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {paymentStep === 'success' && (
              <div className="space-y-4 text-center py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-xl font-serif font-bold text-slate-100">Félicitations !</h4>
                  <p className="text-xs text-slate-300">
                    Votre abonnement <strong className="text-amber-300">{selectedPlanForCheckout.name}</strong> a été activé avec succès sur votre compte.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-amber-400">
                  +{selectedPlanForCheckout.credits.toLocaleString()} Crédits IA ajoutés à votre compte
                </div>

                <button
                  onClick={() => {
                    setSelectedPlanForCheckout(null);
                    if (setActiveTab) setActiveTab('novels');
                  }}
                  className="w-full py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-md hover:bg-amber-400 transition-colors"
                >
                  Commencer à Créer un Film
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

// Mini SVG helper components
const AppleIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={`${className} fill-current`} viewBox="0 0 170 170">
    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.82.13-9.74-1.93-14.76-6.19-3.23-2.73-7.1-7.37-11.61-13.91-6.12-8.73-10.99-18.42-14.61-29.07-3.62-10.65-5.43-21.2-5.43-31.65 0-14.07 3.51-25.79 10.53-35.15 7.02-9.36 15.82-14.16 26.4-14.4 4.58 0 9.87 1.25 15.88 3.75 6.01 2.5 10.12 3.75 12.33 3.75 1.77 0 6.04-1.32 12.82-3.96 6.78-2.64 12.19-3.83 16.23-3.57 11.83.97 21.05 5.28 27.67 12.93-10.62 6.42-15.8 15.42-15.54 27 0 10.02 3.86 18.29 11.58 24.81 7.72 6.52 16.92 10.12 27.6 10.8-2.31 6.81-5.32 13.62-9.03 20.43zM119.22 31.84c0-7.35 2.65-14.47 7.95-21.36 5.3-6.89 12.03-10.87 20.19-11.94.13 1.03.19 1.94.19 2.73 0 7.37-2.73 14.62-8.19 21.75-5.46 7.13-12.18 11.13-20.14 12-0.08-.85-.12-1.92-.12-3.18z" />
  </svg>
);

const GoogleIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"/>
    <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"/>
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"/>
  </svg>
);
