import fs from 'fs';
import path from 'path';
import { Disclosure } from '@/components/ui/disclosure';

export default async function Methodology() {
  const filePath = path.join(process.cwd(), 'docs', 'METHODOLOGY.md');
  const fileContent = fs.readFileSync(filePath, 'utf8');

  // Extremely basic markdown parser just for the methodology display requirements
  const htmlContent = fileContent
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-8 mb-4 text-forest-800">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-6 text-charcoal-900">$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/`(.*?)`/gim, '<code class="bg-charcoal-100 text-charcoal-800 px-1 rounded font-mono text-sm">$1</code>')
    .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc mb-1">$1</li>')
    .replace(/\n\n/gim, '</p><p class="mb-4 text-charcoal-700 leading-relaxed">');

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      <div 
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: `<p class="mb-4 text-charcoal-700 leading-relaxed">${htmlContent}</p>` }} 
      />

      <div className="mt-12 space-y-4">
        <h2 className="text-xl font-bold text-forest-800 border-b border-charcoal-200 pb-2">Transparency Disclosures</h2>
        
        <Disclosure title="How do we ensure privacy?">
          All calculations in Judge Demo Mode run entirely locally on your device. We do not transmit your constraints or activity data to any remote server.
        </Disclosure>
        
        <Disclosure title="What happens when an action is rejected?">
          If an item in the Evidence Ledger is rejected (e.g. invalid receipt), the `verifiedSavingsKgCO2e` mathematically returns to zero, preventing false claims of emission reductions.
        </Disclosure>

        <Disclosure title="How is data quality factored?">
          Data quality (0-100) dictates the error margin applied to your inputs. A score of 100 assumes perfect measurement (0% input error), while 0 assumes a pure guess (50% input error). This is combined with the intrinsic factor uncertainty using Root Sum Square.
        </Disclosure>
      </div>
    </div>
  );
}
