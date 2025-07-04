const { Connection, PublicKey, LAMPORTS_PER_SOL } = require("@solana/web3.js");

// اتصال بشبكة Solana الرئيسية
const connection = new Connection("https://mainnet.helius-rpc.com/?api-key=9f3299ea-1351-4f90-89b6-8ac3a7de21f4");

async function checkBalance() {
  try {
    // عنوان المحفظة المراد فحصها
    const walletAddress = "DfJwmTNHKcpzMmN8U5FfhX9xxkAhmXdvw1bUHB4xNMr3";
    
    // الحصول على الرصيد
    const balance = await connection.getBalance(new PublicKey(walletAddress));
    
    // تحويل من LAMPORTS إلى SOL
    const solBalance = balance / LAMPORTS_PER_SOL;
    
    console.log("💰 الرصيد الحالي:", solBalance, "SOL");
    
    if (balance > 0) {
      console.log("✅ جاهز للتداول!");
      console.log("💵 القيمة بالدولار: ~$" + (solBalance * 150).toFixed(2));
    } else {
      console.log("⚠️ المحفظة فارغة. أرسل SOL لبدء التداول:");
      console.log("📧 العنوان:", walletAddress);
    }
  } catch (error) {
    console.log("❌ خطأ:", error.message);
  }
}

// تشغيل فحص الرصيد
checkBalance();