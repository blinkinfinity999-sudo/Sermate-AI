import { ScreenScenario } from '../types';

export const MOCK_SCENARIOS: ScreenScenario[] = [
  {
    id: 'react-runtime-crash',
    title: 'React Cart Crash (TypeError: undefined map)',
    category: 'Code Error',
    description: 'Uncaught TypeError when rendering items in ShoppingCartDrawer component after empty state.',
    defaultPrompt: 'What caused this runtime crash and how do I fix the cart render function?',
    screenType: 'svg-code',
    mockResult: {
      summary: 'TypeError: Cannot read properties of undefined (reading \'map\') in CartItemsList component.',
      detailedAnswer: `The error occurs because \`cartData.items\` evaluates to \`undefined\` during initial load or when the server returns an empty state payload (\`{ items: null }\`).

### Root Cause Analysis:
1. **Direct Unchecked Property Access**: \`cartData.items.map(...)\` assumes \`items\` is always an initialized array.
2. **Missing Optional Chaining / Fallback**: No default empty array \`[]\` was provided in destructuring or state declaration.

### Recommended Fix:
Use optional chaining with a fallback array \`(cartData?.items ?? []).map(...)\` and add a defensive empty state check before rendering the items list.`,
      detectedCategory: 'Code Error',
      confidence: 0.98,
      actionItems: [
        'Apply optional chaining: (cartData?.items || []).map(...)',
        'Add CartSkeleton loader while query isPending',
        'Verify backend API contract returns empty array instead of null'
      ],
      codeSnippet: {
        language: 'tsx',
        filename: 'src/components/ShoppingCartDrawer.tsx',
        code: `// Fixed Implementation
export function CartItemsList({ cartData, isLoading }: CartProps) {
  if (isLoading) return <CartSkeleton />;
  
  const items = cartData?.items ?? [];
  if (items.length === 0) {
    return <EmptyCartMessage />;
  }

  return (
    <div className="divide-y divide-slate-800">
      {items.map((item) => (
        <CartItemRow key={item.id} item={item} />
      ))}
    </div>
  );
}`
      },
      boundingBoxes: [
        {
          id: 'box-err-1',
          label: 'Uncaught Exception in render()',
          type: 'error',
          box2d: [18, 12, 38, 88],
          description: 'TypeError: Cannot read properties of undefined (reading \'map\') at CartItemsList.tsx:42'
        },
        {
          id: 'box-err-2',
          label: 'Defective Array Map Call',
          type: 'warning',
          box2d: [44, 18, 64, 76],
          description: 'cartData.items is null when apiResponse resolves before hydration.'
        },
        {
          id: 'box-err-3',
          label: 'Suggested Patch Location',
          type: 'interactive',
          box2d: [68, 20, 88, 80],
          description: 'Add default items: [] fallback in component props'
        }
      ],
      suggestedFollowUps: [
        'How do I add TypeScript guards for cartData?',
        'Show me how to mock this in Vitest / React Testing Library',
        'Generate an empty cart placeholder component'
      ]
    }
  },
  {
    id: 'mobile-ui-checkout-flaw',
    title: 'Mobile Checkout UI & Contrast Defect',
    category: 'UI/UX Review',
    description: 'Sticky checkout button overlapping total price text with insufficient color contrast.',
    defaultPrompt: 'Audit this mobile checkout screen for layout bugs and WCAG accessibility issues.',
    screenType: 'svg-mobile',
    mockResult: {
      summary: 'Critical UI overlap detected: Fixed sticky footer obscures order summary and fails WCAG AA contrast standards.',
      detailedAnswer: `### Visual & Accessibility Audit Report:
1. **Z-Index & Padding Conflict**: The \`fixed bottom-0\` checkout button container lacks corresponding bottom padding (\`pb-28\`) on the scrollable container, causing the subtotal and discount badge to be clipped.
2. **WCAG 2.1 Contrast Violation**: Gray text \`#71717A\` on dark slate background \`#09090B\` gives a **2.6:1 contrast ratio**, failing AA compliance (4.5:1 required).
3. **Touch Target Size**: The "Remove Coupon" tap area is only 26px x 26px, below the recommended **44px x 44px** mobile touch target guidelines.`,
      detectedCategory: 'UI/UX Review',
      confidence: 0.96,
      actionItems: [
        'Add pb-24 (safe-area-inset-bottom) to the scrollable cart container',
        'Upgrade muted text from text-zinc-500 to text-slate-300 for 5.2:1 contrast',
        'Increase touch target of secondary actions to min-h-[44px]'
      ],
      codeSnippet: {
        language: 'html',
        filename: 'src/views/MobileCheckoutView.tsx',
        code: `<!-- Tailwind CSS Fix -->
<div className="flex-1 overflow-y-auto px-4 pb-28">
  <!-- Order Items & Totals -->
  <div className="space-y-3 text-slate-200">
    <div className="flex justify-between text-slate-300 font-medium">
      <span>Subtotal</span>
      <span>$148.00</span>
    </div>
  </div>
</div>

<!-- Sticky Safe Area Footer -->
<div className="fixed bottom-0 inset-x-0 bg-slate-900/95 backdrop-blur-md p-4 border-t border-slate-800 pb-[calc(1rem+env(safe-area-inset-bottom))]">
  <button className="w-full h-12 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/25">
    Complete Checkout ($148.00)
  </button>
</div>`
      },
      boundingBoxes: [
        {
          id: 'box-ui-1',
          label: 'Button Overlapping Subtotal',
          type: 'error',
          box2d: [65, 8, 92, 92],
          description: 'Fixed bar overlaps the summary elements due to missing scrollable bottom padding.'
        },
        {
          id: 'box-ui-2',
          label: 'Low Contrast Text (2.6:1)',
          type: 'warning',
          box2d: [48, 14, 60, 86],
          description: 'Muted grey text fails WCAG 2.1 AA minimum contrast threshold.'
        },
        {
          id: 'box-ui-3',
          label: 'Sub-44px Touch Target',
          type: 'info',
          box2d: [35, 68, 44, 90],
          description: 'Coupon remove button is 24px wide; target should be min 44px.'
        }
      ],
      suggestedFollowUps: [
        'How to handle iOS bottom notch safe-area in Tailwind?',
        'Suggest an accessible color palette for dark mode',
        'Provide a 1-click refactored JSX file'
      ]
    }
  },
  {
    id: 'db-deadlock-alert',
    title: 'PostgreSQL Lock Conflict & High Latency Alert',
    category: 'Bug/Crash',
    description: 'Server metrics showing 504 Gateway Timeouts caused by row lock deadlock on orders table.',
    defaultPrompt: 'Analyze this server dashboard alert and explain how to eliminate the transaction deadlock.',
    screenType: 'svg-app',
    mockResult: {
      summary: 'Deadlock detected: Concurrent transactions updating \`orders\` and \`inventory_reservations\` in reverse key order.',
      detailedAnswer: `### Database Lock Incident Analysis:
- **Error Code**: \`40P01 (deadlock_detected)\`
- **Root Cause**: Process A acquired an exclusive row lock on \`orders (id: 9841)\` and waits for \`inventory (sku: #A12)\`. Meanwhile, Process B locked \`inventory (sku: #A12)\` and is attempting to lock \`orders (id: 9841)\`.

### Recommended Resolution:
1. **Enforce Consistent Lock Order**: Always lock rows in identical alphabetical/primary key order across all application transaction paths.
2. **Use SELECT FOR UPDATE SKIP LOCKED**: For background queue workers, prevent holding locks against incoming user checkouts.`,
      detectedCategory: 'Bug/Crash',
      confidence: 0.97,
      actionItems: [
        'Order resource acquisition by item ID: items.sort((a, b) => a.id - b.id)',
        'Set deadlock_timeout = 200ms and statement_timeout = 5s in DB pool config',
        'Switch stock reservation to optimistic concurrency / atomic decrement'
      ],
      codeSnippet: {
        language: 'sql',
        filename: 'migrations/optimize_locks.sql',
        code: `-- Atomic Inventory Reservation without row lock deadlock
UPDATE inventory 
SET available_stock = available_stock - $1,
    reserved_stock = reserved_stock + $1,
    updated_at = NOW()
WHERE sku = $2 
  AND available_stock >= $1;

-- Returns 1 if successful, 0 if out of stock (instant atomic operation)`
      },
      boundingBoxes: [
        {
          id: 'box-db-1',
          label: '504 Latency Spike: 14,200ms',
          type: 'error',
          box2d: [15, 60, 42, 95],
          description: 'HTTP 504 Gateway Timeout rate spiked to 18.4% during batch checkout.'
        },
        {
          id: 'box-db-2',
          label: 'Deadlock Exception in Log Stream',
          type: 'warning',
          box2d: [55, 10, 85, 55],
          description: 'Postgres Error 40P01: deadlock detected on relation orders.'
        }
      ],
      suggestedFollowUps: [
        'How to configure optimistic locking with Drizzle / Prisma?',
        'Write a redis distributed lock helper in TypeScript',
        'What index should I add to speed up inventory queries?'
      ]
    }
  },
  {
    id: 'analytics-anomaly-extraction',
    title: 'SaaS Q3 Revenue & Churn Anomaly Extraction',
    category: 'Data Extraction',
    description: 'Financial dashboard showing ARR expansion, gross retention dip in Enterprise cohort.',
    defaultPrompt: 'Extract key performance metrics, calculate growth rates, and highlight anomalies from this chart.',
    screenType: 'svg-chart',
    mockResult: {
      summary: 'Data extraction complete: ARR reached $4.2M (+24% YoY), but Enterprise cohort churn increased by 3.8% in August.',
      detailedAnswer: `### Extracted Financial Breakdown:
| Metric | Q2 2026 | Q3 2026 | Variance (%) | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Total ARR** | $3.38M | **$4.20M** | +24.2% | Healthy 🟢 |
| **Net Revenue Retention (NRR)** | 118% | **124%** | +6.0 pts | Strong 🟢 |
| **Enterprise Churn Rate** | 1.4% | **5.2%** | +3.8 pts | Alert 🔴 |
| **CAC Payback Period** | 11.2 mo | **9.4 mo** | -16.0% | Optimized 🟢 |

### Key Insight:
While overall expansion ARR is up driven by self-serve adoption, **Enterprise churn tripled in August** due to 2 account renewals slipping past end-of-quarter.`,
      detectedCategory: 'Data Extraction',
      confidence: 0.95,
      actionItems: [
        'Export table data directly to CSV / Excel format',
        'Schedule customer success intervention for 3 at-risk enterprise accounts',
        'Set up automated Slack alerts when cohort churn exceeds 2.5%'
      ],
      codeSnippet: {
        language: 'json',
        filename: 'extracted_metrics.json',
        code: `{
  "quarter": "Q3-2026",
  "total_arr_usd": 4200000,
  "nrr_percentage": 124,
  "cac_payback_months": 9.4,
  "cohort_churn_enterprise": 0.052,
  "key_findings": [
    "Expansion ARR surpassed targets by $320k",
    "Enterprise retention requires CS review"
  ]
}`
      },
      boundingBoxes: [
        {
          id: 'box-data-1',
          label: 'ARR Peak ($4.2M Milestone)',
          type: 'interactive',
          box2d: [20, 15, 52, 50],
          description: 'Year-over-year revenue accelerated by +24.2%.'
        },
        {
          id: 'box-data-2',
          label: 'Enterprise Churn Anomaly (+3.8%)',
          type: 'error',
          box2d: [56, 52, 88, 92],
          description: 'August churn spike identified as statistical outlier.'
        }
      ],
      suggestedFollowUps: [
        'Download this breakdown as a CSV spreadsheet',
        'Draft an executive summary email for the board',
        'Calculate cohort lifetime value (LTV)'
      ]
    }
  }
];
