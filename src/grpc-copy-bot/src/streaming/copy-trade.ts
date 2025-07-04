import { streamTargetTrader } from "./stream-trader";
import { init } from "../transaction/transaction";
import { logger } from "../../../helpers/logger";
import { fork } from "child_process";
import bs58 from "bs58";
import path from "path";
export const stream_trader_path = path.join(__dirname, "stream-trader.ts");
import { program } from "commander";

let targetTraderToCopy: string = "";

program
  .option("--trader <TRADER_ADDRESS>", "Specify the trader you want to copy")
  .option("-h, --help", "display help for command")
  .action((options: any) => {
    if (options.help) {
      logger.info("ts-node copy-trade.ts --trader <TRADER_ADDRESS_TO_COPY>");
      process.exit(0);
    }
    if (options.trader) {
      targetTraderToCopy = options.trader;
    }
  });

program.parse();

async function snipe() {
  // التحقق من وجود عنوان المتداول
  if (!targetTraderToCopy) {
    logger.error("❌ Missing trader address. Please provide --trader <TRADER_ADDRESS>");
    logger.info("Usage: ts-node copy-trade.ts --trader <TRADER_ADDRESS_TO_COPY>");
    process.exit(1);
  }

  // التحقق من صحة العنوان
  try {
    // محاولة تحويل العنوان للتأكد من صحته
    const publicKey = new (require('@solana/web3.js').PublicKey)(targetTraderToCopy);
    logger.info(`✅ Valid trader address: ${publicKey.toBase58()}`);
  } catch (error) {
    logger.error(`❌ Invalid trader address: ${targetTraderToCopy}`);
    logger.error("Please provide a valid Solana wallet address");
    process.exit(1);
  }

  // show the options
  logger.info(`🎯 Target Trader: ${targetTraderToCopy}`);
  logger.info(`🤖 Bot will copy trades from ${targetTraderToCopy}`);

  try {
    // initialize the bot
    logger.info("🔧 Initializing bot...");
    await init();
    logger.info("✅ Bot initialized successfully");

    // Start copy trading
    logger.info("🚀 Starting copy trading...");
    await streamTargetTrader(targetTraderToCopy);
    
  } catch (e) {
    logger.error(`❌ Error when streaming: ${e}`);
    logger.info("🔄 Retrying in 3 seconds...");
    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    // إعادة المحاولة مع عداد للحد من المحاولات اللانهائية
    await retrySnipe(1);
  }
}

async function retrySnipe(attempt: number) {
  const maxRetries = 5;
  
  if (attempt > maxRetries) {
    logger.error(`❌ Max retries (${maxRetries}) reached. Stopping bot.`);
    process.exit(1);
  }

  logger.info(`🔄 Retry attempt ${attempt}/${maxRetries}`);
  
  try {
    await streamTargetTrader(targetTraderToCopy);
  } catch (e) {
    logger.error(`❌ Retry ${attempt} failed: ${e}`);
    logger.info(`🔄 Retrying in ${attempt * 2} seconds...`);
    await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
    await retrySnipe(attempt + 1);
  }
}

// معالجة إيقاف البرنامج بأمان
process.on('SIGINT', () => {
  logger.info("🛑 Bot stopped by user");
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info("🛑 Bot terminated");
  process.exit(0);
});

// معالجة الأخطاء غير المتوقعة
process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// بدء البوت
snipe();