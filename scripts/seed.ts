import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sales-automation-bmdqg9b6a0d3ffem.southafricanorth-01.azurewebsites.net/api';
const EMAIL = 'nipho@nexus.io';
const PASSWORD = 'nipho@123';

const api = axios.create({ baseURL: API_URL });

async function runSeeder() {
  try {
    console.log('Logging in as Sales Exec (nipho@nexus.io)...');
    const loginRes = await api.post('/auth/login', { email: EMAIL, password: PASSWORD });
    const token = loginRes.data.token;
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    console.log('Login successful. Setting up key enterprise accounts...');
    
    // Create meaningful clients to tell a story
    const clientsData = [
      { name: 'Stellar Dynamics', industry: 'Aerospace', clientType: 2, website: 'stellardynamics.com' },
      { name: 'National Health Services', industry: 'Healthcare', clientType: 1, website: 'nhs-org.example.com' },
      { name: 'Global Tech Partners', industry: 'Technology', clientType: 3, website: 'globaltech.io' },
      { name: 'Apex Financial', industry: 'Finance', clientType: 2, website: 'apexfin.com' },
      { name: 'Nova Logistics', industry: 'Transportation', clientType: 2, website: 'novalogistics.net' },
      { name: 'City of Metropolis', industry: 'Government', clientType: 1, website: 'metropolis.gov' }
    ];
    const clientIds = [];
    for (const c of clientsData) {
        const res = await api.post('/clients', c);
        clientIds.push(res.data.id);
        console.log(`Secured account: ${c.name}`);
    }

    // Story-driven opportunities over the last 6 months
    // Month -5: The startup struggle (small deals)
    // Month -3: A government breakthrough (large deal)
    // Month 0 (Current): Expanding the pipeline (mixed stages)
    
    const narrativeOpportunities = [
      // 5 Months Ago: Humble Beginnings
      { monthsAgo: 5, clientId: clientIds[2], name: 'Initial Tech Stack License', stage: 5, value: 45000, prob: 100 },
      { monthsAgo: 5, clientId: clientIds[0], name: 'Aerospace Q1 Pilot', stage: 6, value: 500000, prob: 0, reason: 'Budget Cuts' },
      { monthsAgo: 5, clientId: clientIds[4], name: 'Nova Tracker Initial Pitch', stage: 6, value: 85000, prob: 0, reason: 'Went with competitor' },
      
      // 4 Months Ago: Gaining Traction
      { monthsAgo: 4, clientId: clientIds[2], name: 'Tech Partners - Data Addon', stage: 5, value: 120000, prob: 100 },
      { monthsAgo: 4, clientId: clientIds[3], name: 'Apex Fin - Compliance Software', stage: 5, value: 350000, prob: 100 },
      { monthsAgo: 4, clientId: clientIds[5], name: 'Metropolis Digital Records MVP', stage: 5, value: 650000, prob: 100 },

      // 3 Months Ago: The Big Fish and Expansion
      { monthsAgo: 3, clientId: clientIds[1], name: 'NHS National Rollout Phase 1', stage: 5, value: 2500000, prob: 100 },
      { monthsAgo: 3, clientId: clientIds[4], name: 'Nova Logistics - Fleet Management', stage: 5, value: 920000, prob: 100 },
      { monthsAgo: 3, clientId: clientIds[2], name: 'Global Tech - Security Training', stage: 6, value: 150000, prob: 0, reason: 'Internal built' },
      
      // 2 Months Ago: Steady Growth
      { monthsAgo: 2, clientId: clientIds[0], name: 'Aerospace Q3 Infrastructure Revival', stage: 4, value: 850000, prob: 70 }, // Negotiation
      { monthsAgo: 2, clientId: clientIds[3], name: 'Apex Fin - Security Audit Tool', stage: 5, value: 180000, prob: 100 },
      { monthsAgo: 2, clientId: clientIds[5], name: 'Metropolis Civic Portal', stage: 3, value: 1250000, prob: 50 }, // Proposal

      // 1 Month Ago: Heating up
      { monthsAgo: 1, clientId: clientIds[1], name: 'NHS Phase 2 Expansion', stage: 3, value: 3200000, prob: 50 }, // Proposal
      { monthsAgo: 1, clientId: clientIds[2], name: 'Global Tech - Cloud Migration', stage: 5, value: 420000, prob: 100 },
      { monthsAgo: 1, clientId: clientIds[4], name: 'Nova Logistics - Global Expansion', stage: 2, value: 2100000, prob: 30 }, // Qualified

      // Current Month: Active Pipeline (Lots of new leads)
      { monthsAgo: 0, clientId: clientIds[0], name: 'Stellar Dynamics - Global Comms', stage: 2, value: 1500000, prob: 30 }, // Qualified
      { monthsAgo: 0, clientId: clientIds[3], name: 'Apex Fin - Retail Banking Module', stage: 1, value: 750000, prob: 10 }, // Lead
      { monthsAgo: 0, clientId: clientIds[1], name: 'NHS - Advanced Analytics', stage: 1, value: 900000, prob: 10 }, // Lead
      { monthsAgo: 0, clientId: clientIds[5], name: 'Metropolis Smart City Sensors', stage: 1, value: 4500000, prob: 10 }, // Lead
      { monthsAgo: 0, clientId: clientIds[2], name: 'Tech Partners QA Automation', stage: 1, value: 300000, prob: 10 }, // Lead
      { monthsAgo: 0, clientId: clientIds[4], name: 'Nova Logistics AI Routing', stage: 1, value: 1100000, prob: 10 } // Lead
    ];

    console.log(`\nFleshing out the pipeline narrative...`);

    for (const opp of narrativeOpportunities) {
        let d = new Date();
        d.setMonth(d.getMonth() - opp.monthsAgo);
        
        const payload = {
            clientId: opp.clientId,
            name: opp.name,
            stage: opp.stage,
            value: opp.value,
            probability: opp.prob,
            expectedCloseDate: d.toISOString(),
            createdAt: d.toISOString(), // Let's see if the API respects backdating on creation
            lossReason: opp.reason || null
        };

        try {
            const res = await api.post('/opportunities', payload);
            const oppId = res.data.id;
            
            // Explicitly advance stage if it's not a Lead (Stage 1)
            if (opp.stage > 1) {
               await api.put(`/opportunities/${oppId}/stage`, { 
                  stage: opp.stage, 
                  notes: 'Seeded historical progression', 
                  lossReason: opp.reason || null 
               });
            }

            const status = opp.stage === 5 ? '✅ WON' : opp.stage === 6 ? '❌ LOST' : '⏳ ACTIVE';
            console.log(`[Month -${opp.monthsAgo}] ${status} - ${payload.name} (R${payload.value.toLocaleString()})`);
            
            // If the API does not allow createdAt to be set, we might need a direct DB seed. 
            // For now, testing if the API accepts it.
        } catch (e: any) {
            console.error(`Failed Opp "${opp.name}":`, e.response?.data || e.message);
        }
    }
    
    console.log('\nFinished seeding narrative data! Check your dashboard.');

  } catch (error: any) {
    console.error('Seeder failed:', error.response?.data || error.message);
  }
}

runSeeder();
