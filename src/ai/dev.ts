import { config } from 'dotenv';
config();

import '@/ai/flows/data-assisted-kyc-reminder.ts';
import '@/ai/posts_flow/generate-multi-platform-text.ts';
import '@/ai/posts_flow/generate-image-sets.ts';
import './community_flow/speech-to-text';
import './community_flow/voice-navigation';
import './community_flow/generate-tags';
