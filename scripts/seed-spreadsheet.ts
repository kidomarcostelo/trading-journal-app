import { google } from 'googleapis';
import { Command } from 'commander';
import dotenv from 'dotenv';

dotenv.config();

const program = new Command();

program
  .name('seed')
  .description('Seed the Google Spreadsheet with sample data')
  .option('-c, --clear', 'Clear existing data before seeding', false)
  .action(async (options) => {
    try {
      const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
      const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      let privateKey = process.env.GOOGLE_PRIVATE_KEY;

      if (!spreadsheetId || !serviceAccountEmail || !privateKey) {
        console.error('Error: GOOGLE_SPREADSHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, and GOOGLE_PRIVATE_KEY must be set in .env');
        process.exit(1);
      }

      // Cleanup private key (handle both escaped \n and real newlines)
      privateKey = privateKey.replace(/\\n/g, '\n');

      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: serviceAccountEmail,
          private_key: privateKey,
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const client = await auth.getClient();
      const sheets = google.sheets({ version: 'v4', auth: client as any });

      console.log(`[Seed] Target Spreadsheet ID: ${spreadsheetId}`);

      if (options.clear) {
        console.log('[Seed] Clearing existing data from Master and Settings sheets...');
        await sheets.spreadsheets.values.clear({
          spreadsheetId,
          range: 'Master!A1:ZZ1000',
        });
        await sheets.spreadsheets.values.clear({
          spreadsheetId,
          range: 'Settings!A1:ZZ1000',
        });
      }

      // --- 1. SEED SETTINGS ---
      console.log('[Seed] Seeding Settings sheet...');
      
      const chips = [
        {
          id: 'Strategies',
          values: ['Trend Following', 'Mean Reversion', 'Breakout', 'ICT Silver Bullet', 'SMC Liquidity Grab', 'FVG Re-entry']
        },
        {
          id: 'Psychology',
          values: ['Fear of Missing Out', 'Revenge Trading', 'Patient Entry', 'Hesitation', 'Greed', 'Confident Execution']
        },
        {
          id: 'Timeframe',
          values: ['1m', '5m', '15m', '1h', '4h', '1D']
        },
        {
          id: 'Confluence',
          values: ['PDH/PDL', 'Session High/Low', 'VWAP', 'RSI Divergence', 'Volume Spike']
        }
      ];

      const settingsData = [
        ['Key', 'Value'],
        ['chips', JSON.stringify(chips)]
      ];

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Settings!A1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: settingsData,
        },
      });

      // --- 2. SEED MASTER ---
      console.log('[Seed] Seeding Master sheet...');

      const headers = [
        'ID', 'Date', 'Time', 'Pair', 'Market', 'Direction', 'Entry Price', 'Exit Price', 'Size', 'PnL', 'Outcome (R)', 'MFE', 'MAE', 'Status', 'Notes', 'Strategies', 'Psychology', 'Timeframe'
      ];

      const sampleTrades = [
        ['1', '03/01/2026', '09:30', 'BTC/USDT', 'Crypto', 'Long', '62500', '64000', '0.1', '150', '2.5', '3.1', '0.5', 'Closed', 'Beautiful breakout play.', 'Breakout', 'Patient Entry', '15m'],
        ['2', '03/02/2026', '14:15', 'EUR/USD', 'Forex', 'Short', '1.0850', '1.0870', '100000', '-200', '-1', '0.2', '1.2', 'Closed', 'Stopped out on news.', 'Mean Reversion', 'Fear of Missing Out', '1h'],
        ['3', '03/03/2026', '10:00', 'AAPL', 'Stocks', 'Long', '185.50', '190.00', '50', '225', '3', '3.5', '0.1', 'Closed', 'Strong earnings follow-through.', 'Trend Following', 'Confident Execution', '1D'],
        ['4', '03/05/2026', '08:45', 'XAU/USD', 'Commodities', 'Short', '2045.00', '', '10', '', '', '0.5', '0.2', 'Open', 'Expecting retest of support.', 'ICT Silver Bullet', 'Patient Entry', '5m'],
        ['5', '03/06/2026', '16:00', 'NQ1!', 'Indices', 'Long', '17800', '17900', '1', '100', '1.5', '2.0', '0.8', 'Closed', 'Late session bounce.', 'SMC Liquidity Grab', 'Hesitation', '15m'],
        ['6', '03/07/2026', '11:20', 'SOL/USDT', 'Crypto', 'Long', '135.20', '132.00', '20', '-64', '-1', '0.1', '1.5', 'Closed', 'Failed retest.', 'FVG Re-entry', 'Revenge Trading', '5m'],
        ['7', '03/08/2026', '09:00', 'GBP/JPY', 'Forex', 'Long', '190.50', '', '0.5', '', '', '1.2', '0.3', 'Open', 'Carry trade setup.', 'Trend Following', 'Confident Execution', '4h'],
        ['8', '03/10/2026', '15:30', 'TSLA', 'Stocks', 'Short', '175.00', '170.00', '30', '150', '2', '2.5', '0.5', 'Closed', 'Gap fill completion.', 'Mean Reversion', 'Patient Entry', '1D'],
        ['9', '03/12/2026', '13:00', 'ETH/USDT', 'Crypto', 'Short', '3800', '3900', '2', '-200', '-1', '0.5', '1.5', 'Closed', 'Overshot supply zone.', 'SMC Liquidity Grab', 'Greed', '1h'],
        ['10', '03/14/2026', '10:15', 'Oil', 'Commodities', 'Long', '78.50', '80.00', '100', '150', '2.5', '3.0', '0.2', 'Closed', 'Inventory data play.', 'Breakout', 'Patient Entry', '15m'],
        ['11', '03/15/2026', '09:45', 'BTC/USDT', 'Crypto', 'Long', '68000', '71000', '0.05', '150', '3', '3.5', '0.5', 'Closed', 'ATH breakout.', 'Breakout', 'Confident Execution', '15m'],
        ['12', '03/16/2026', '14:30', 'EUR/GBP', 'Forex', 'Short', '0.8550', '0.8570', '100000', '-200', '-1', '0.1', '1.2', 'Closed', 'False breakdown.', 'FVG Re-entry', 'Hesitation', '1h'],
        ['13', '03/17/2026', '10:00', 'NVDA', 'Stocks', 'Long', '850', '900', '5', '250', '2', '2.5', '0.8', 'Closed', 'AI hype continuation.', 'Trend Following', 'Confident Execution', '1D'],
        ['14', '03/18/2026', '11:00', 'XAU/USD', 'Commodities', 'Long', '2150', '', '5', '', '', '2.5', '0.1', 'Open', 'Bull flag breakout.', 'Breakout', 'Patient Entry', '5m'],
        ['15', '03/19/2026', '15:00', 'SPY', 'Indices', 'Short', '510', '505', '40', '200', '2.5', '3.0', '0.2', 'Closed', 'EOD sell-off.', 'Mean Reversion', 'Patient Entry', '15m'],
        ['16', '03/20/2026', '09:30', 'SOL/USDT', 'Crypto', 'Long', '145', '140', '15', '-75', '-1', '0.5', '1.5', 'Closed', 'Fatigue at resistance.', 'SMC Liquidity Grab', 'Fear of Missing Out', '5m'],
        ['17', '03/21/2026', '12:00', 'USD/JPY', 'Forex', 'Long', '151.20', '', '100000', '', '', '0.8', '0.3', 'Open', 'Intervention watch.', 'Trend Following', 'Confident Execution', '4h'],
        ['18', '03/22/2026', '10:30', 'AMD', 'Stocks', 'Short', '195', '185', '20', '200', '3', '3.5', '0.5', 'Closed', 'Sector rotation.', 'Mean Reversion', 'Patient Entry', '1D'],
        ['19', '03/23/2026', '14:00', 'ETH/USDT', 'Crypto', 'Long', '3500', '3400', '3', '-300', '-1', '0.2', '1.5', 'Closed', 'Sweep of lows failed.', 'SMC Liquidity Grab', 'Revenge Trading', '15m'],
        ['20', '03/24/2026', '09:00', 'BTC/USDT', 'Crypto', 'Long', '72000', '75000', '0.02', '60', '2', '2.5', '0.5', 'Closed', 'Standard continuation.', 'Trend Following', 'Confident Execution', '15m']
      ];

      const masterData = [
        headers,
        ...sampleTrades
      ];

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Master!A1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: masterData,
        },
      });

      console.log('[Seed] Seeding completed successfully!');
    } catch (error: any) {
      console.error(`[Seed] Error: ${error.message}`);
      if (error.response) {
        console.error(`[Seed] API Response: ${JSON.stringify(error.response.data)}`);
      }
      process.exit(1);
    }
  });

program.parse(process.argv);
