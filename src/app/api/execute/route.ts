import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { command } = await req.json();
    if (!command) {
      return NextResponse.json({ output: '' });
    }

    const args = command.trim().split(/\s+/);
    const baseCommand = args[0];

    // Helper to log command
    const logCommand = async (isSuccess: boolean) => {
      await prisma.commandLog.create({
        data: {
          command: command.trim(),
          isSuccess,
          userId: session.userId,
        }
      });
    };

    // Built-in commands
    if (baseCommand === 'help') {
      await logCommand(true);
      return NextResponse.json({
        output: 'Available commands:\n  help    - Show this message\n  whoami  - Show current user\n  date    - Show system date\n  sudo    - Execute command as superuser',
        delayTime: 0
      });
    }

    if (baseCommand === 'whoami') {
      await logCommand(true);
      return NextResponse.json({ output: `root (${session.username})`, delayTime: 0 });
    }

    if (baseCommand === 'date') {
      await logCommand(true);
      return NextResponse.json({ output: new Date().toString(), delayTime: 0 });
    }

    if (baseCommand === './setup_env.sh') {
      await logCommand(true);
      const setupOutput = `[delay:400] [color:cyan][*][color:reset] Initializing virtual environment...
[delay:600] [color:green][+][color:reset] Virtual environment created successfully.
[delay:300] [color:cyan][*][color:reset] Fetching dependencies...
[delay:200] [update-line][color:cyan][*][color:reset] Fetching dependencies... [###.................] 15%
[delay:200] [update-line][color:cyan][*][color:reset] Fetching dependencies... [########............] 40%
[delay:400] [update-line][color:cyan][*][color:reset] Fetching dependencies... [###############.....] 75%
[delay:300] [update-line][color:cyan][*][color:reset] Fetching dependencies... [####################] 100%
[delay:500] [color:green][+][color:reset] Dependencies installed.
[delay:800] [color:cyan][*][color:reset] Configuring neural-proxy tunnels... DONE.
[delay:400] [color:green][+][color:reset] Environment setup complete. Ready to connect.`;
      return NextResponse.json({ output: setupOutput, delayTime: 0 });
    }

    if (command.trim() === './connect --host Lucifers_Server_v01') {
      await logCommand(true);
      const connectOutput = `[delay:800] [color:cyan][*][color:reset] Initializing outbound connection request to 'Lucifers_Server_v01'...
[delay:1200] [color:yellow][>][color:reset] Resolving DNS and locating target server...
[delay:1000] [color:green][+][color:reset] Target acquired at IP: [color:yellow]192.168.1.100[color:reset].
[delay:800] [color:cyan][*][color:reset] Sending SYN packet to port 443...
[delay:1500] [color:green][+][color:reset] SYN-ACK received. Server is acknowledging request.
[delay:800] [color:cyan][*][color:reset] Sending ACK packet. Establishing TCP session...
[delay:1500] [color:yellow][>][color:reset] Bouncing signal through proxy layer 1 (Moscow)...
[delay:1200] [color:yellow][>][color:reset] Bouncing signal through proxy layer 2 (Reykjavik)...
[delay:1500] [color:yellow][>][color:reset] Bouncing signal through proxy layer 3 (Panama)...
[delay:1800] [color:green][+][color:reset] Signal obfuscated. Connection to server opened.
[delay:1000] [color:cyan][*][color:reset] Negotiating RSA-4096 encryption keys...
[delay:1500] [color:green][+][color:reset] Keys accepted. Exchanging SSL certificates...
[delay:1200] [color:cyan][*][color:reset] Validating server certificate signature...
[delay:1000] [color:green][+][color:reset] Signature valid. Securing data tunnel...
[delay:800] [color:green][+][color:reset] Connection to Lucifers_Server_v01 is SECURE and ACTIVE.`;
      return NextResponse.json({ output: connectOutput, delayTime: 0 });
    }

    if (baseCommand === './run_exploit.sh') {
      await logCommand(true);
      
      const userRecord = await prisma.user.findUnique({ where: { id: session.userId } });
      
      if (userRecord?.isRestricted) {
        const restrictedMessage = userRecord.restrictionMessage || "Your device is at limit of Token Generation, please consider upgrading the hardware";
        const blockedOutput = `[delay:300] [color:cyan][*][color:reset] Initializing MSF Exploit Framework...
[delay:500] [color:cyan][*][color:reset] Establishing connection to target: kali-core (192.168.1.100:443)
[delay:800] [color:red][!][color:reset] CONNECTION REFUSED: Hardware Limitation Detected.
[delay:500] [color:red]${restrictedMessage}[color:reset]`;
        return NextResponse.json({ output: blockedOutput, delayTime: 0 });
      }

      await prisma.user.update({
        where: { id: session.userId },
        data: { tokens: { increment: 1 } }
      });

      const hackerOutput = `[delay:1200] [color:cyan][*][color:reset] Initializing MSF Exploit Framework v6.4.1...
[delay:2000] [color:cyan][*][color:reset] Loading auxiliary modules and payloads...
[delay:1500] [color:green][+][color:reset] 847 exploits loaded. 423 auxiliary modules ready.
[delay:2000] [color:cyan][*][color:reset] Scanning target ports and protocols on 192.168.1.100...
[delay:1500] [update-line][color:cyan][*][color:reset] Port scan progress... [color:blue]▰▱▱▱▱▱▱▱▱▱[color:reset] 10%
[delay:1500] [update-line][color:cyan][*][color:reset] Port scan progress... [color:blue]▰▰▰▱▱▱▱▱▱▱[color:reset] 30%
[delay:2000] [update-line][color:cyan][*][color:reset] Port scan progress... [color:blue]▰▰▰▰▰▱▱▱▱▱[color:reset] 50%
[delay:1500] [update-line][color:cyan][*][color:reset] Port scan progress... [color:blue]▰▰▰▰▰▰▰▱▱▱[color:reset] 70%
[delay:2000] [update-line][color:cyan][*][color:reset] Port scan progress... [color:blue]▰▰▰▰▰▰▰▰▰▰[color:reset] 100%
[delay:1000] [color:magenta][+][color:reset] Port 22  (SSH)   OPEN  — OpenSSH 7.9p1 Debian
[delay:500]  [color:magenta][+][color:reset] Port 80  (HTTP)  OPEN  — Apache/2.4.38
[delay:500]  [color:magenta][+][color:reset] Port 443 (HTTPS) OPEN  — nginx/1.14.2 [color:red]VULNERABLE[color:reset]
[delay:500]  [color:magenta][+][color:reset] Port 3306 (MySQL) OPEN — MySQL 5.7.33
[delay:2000] [color:cyan][*][color:reset] CVE-2023-44487 (HTTP/2 Rapid Reset) detected on port 443.
[delay:1500] [color:cyan][*][color:reset] Selecting exploit: exploit/multi/handler/http2_rapid_reset...
[delay:2000] [color:cyan][*][color:reset] Preparing reverse TCP handler on local port 4444...
[delay:2500] [color:cyan][*][color:reset] Injecting primary shellcode payload into memory...
[delay:800]  [update-line][color:cyan][*][color:reset] Injecting payload... [color:blue]▰▱▱▱▱▱▱▱▱▱[color:reset] 10%
[delay:1200] [update-line][color:cyan][*][color:reset] Injecting payload... [color:blue]▰▰▰▱▱▱▱▱▱▱[color:reset] 30%
[delay:1500] [update-line][color:cyan][*][color:reset] Injecting payload... [color:blue]▰▰▰▰▰▰▱▱▱▱[color:reset] 60%
[delay:1000] [update-line][color:cyan][*][color:reset] Injecting payload... [color:blue]▰▰▰▰▰▰▰▰▱▱[color:reset] 85%
[delay:1200] [update-line][color:cyan][*][color:reset] Injecting payload... [color:blue]▰▰▰▰▰▰▰▰▰▰[color:reset] 100%
[delay:2000] [color:green][+][color:reset] Payload injected into kernel space. Meterpreter session 1 opened (192.168.1.1:4444 -> 192.168.1.100:443).
[delay:2000] [color:cyan][*][color:reset] Escalating privileges via CVE-2022-0847 (Dirty Pipe)...
[delay:1500] [update-line][color:cyan][*][color:reset] Privilege escalation... [color:yellow]▓░░░░░░░░░[color:reset] 10%
[delay:1500] [update-line][color:cyan][*][color:reset] Privilege escalation... [color:yellow]▓▓▓▓░░░░░░[color:reset] 40%
[delay:2000] [update-line][color:cyan][*][color:reset] Privilege escalation... [color:yellow]▓▓▓▓▓▓▓▓░░[color:reset] 80%
[delay:1500] [update-line][color:cyan][*][color:reset] Privilege escalation... [color:yellow]▓▓▓▓▓▓▓▓▓▓[color:reset] 100%
[delay:2000] [color:green][+][color:reset] ROOT access obtained. UID=0 confirmed.
[delay:2500] [color:cyan][*][color:reset] Analyzing Neural-Net Firewall architecture (DeepGuard v4.2)...
[delay:1500] [update-line][color:cyan][*][color:reset] Decrypting firewall rules... [color:yellow]▓░░░░░░░░░[color:reset] 12%
[delay:1200] [update-line][color:cyan][*][color:reset] Decrypting firewall rules... [color:yellow]▓▓▓░░░░░░░[color:reset] 34%
[delay:1500] [update-line][color:cyan][*][color:reset] Decrypting firewall rules... [color:yellow]▓▓▓▓▓▓░░░░[color:reset] 68%
[delay:1800] [update-line][color:cyan][*][color:reset] Decrypting firewall rules... [color:yellow]▓▓▓▓▓▓▓▓▓▓[color:reset] 100%
[delay:2000] [color:green][+][color:reset] Firewall rules decrypted. 2,847 rules identified.
[delay:2000] [color:red][!][color:reset] WARNING: IDS detection spike! Anomaly score 94/100 — Active tracking engaged!
[delay:1500] [color:yellow][>][color:reset] Deploying anti-forensics daemon (afd v2.1)...
[delay:2000] [color:yellow][>][color:reset] Spoofing MAC address to: DE:AD:BE:EF:CA:FE
[delay:1500] [color:yellow][>][color:reset] Rerouting through deep-onion Tor network (12 hops)...
[delay:1000] [update-line][color:cyan][*][color:reset] Tor routing... [color:blue]■□□□□□□□□□[color:reset] 10% — Node: Frankfurt
[delay:1000] [update-line][color:cyan][*][color:reset] Tor routing... [color:blue]■■■□□□□□□□[color:reset] 30% — Node: Singapore
[delay:1000] [update-line][color:cyan][*][color:reset] Tor routing... [color:blue]■■■■■□□□□□[color:reset] 50% — Node: Sao Paulo
[delay:1000] [update-line][color:cyan][*][color:reset] Tor routing... [color:blue]■■■■■■■□□□[color:reset] 70% — Node: Reykjavik
[delay:1000] [update-line][color:cyan][*][color:reset] Tor routing... [color:blue]■■■■■■■■■■[color:reset] 100% — Exit: [color:green]ANONYMOUS[color:reset]
[delay:2500] [color:green][+][color:reset] Identity obfuscated. IDS tracking neutralized.
[delay:2500] [color:cyan][*][color:reset] Initiating Deep-Scan on Security Rings...
[delay:1500] [color:yellow][>][color:reset] Penetrating Ring 0 (BIOS/Firmware)... [color:green]SUCCESS[color:reset]
[delay:1800] [color:yellow][>][color:reset] Penetrating Ring 1 (External Routing)... [color:green]SUCCESS[color:reset]
[delay:2000] [color:yellow][>][color:reset] Penetrating Ring 2 (Logic Nodes)... [color:green]SUCCESS[color:reset]
[delay:2500] [color:yellow][>][color:reset] Penetrating Ring 3 (Core Kernel)... [color:green]SUCCESS[color:reset]
[delay:2000] [color:cyan][*][color:reset] Full kernel control achieved. Reading /proc/mem...
[delay:1500] [color:cyan][*][color:reset] Dumping RAM for cryptographic key extraction (32GB)...
[delay:1000] [update-line][color:cyan][*][color:reset] Memory dump... [color:magenta]▓▓░░░░░░░░[color:reset] 20% (6.4 GB)
[delay:1500] [update-line][color:cyan][*][color:reset] Memory dump... [color:magenta]▓▓▓▓▓░░░░░[color:reset] 50% (16 GB)
[delay:2000] [update-line][color:cyan][*][color:reset] Memory dump... [color:magenta]▓▓▓▓▓▓▓▓░░[color:reset] 80% (25.6 GB)
[delay:1500] [update-line][color:cyan][*][color:reset] Memory dump... [color:magenta]▓▓▓▓▓▓▓▓▓▓[color:reset] 100% (32 GB) — COMPLETE
[delay:2000] [color:green][+][color:reset] Memory dump complete. Scanning for AES-256 key material...
[delay:2000] [color:cyan][*][color:reset] Navigating to secure token vault sector 7G (depth: 14 layers)...
[delay:2500] [color:cyan][*][color:reset] Vault locked with AES-256-GCM + SHA-3 HMAC. Initiating brute-force...
[delay:400]  [update-line][color:yellow][>][color:reset] [CRACKING] SHA3-256 0xA3F7${Math.random().toString(16).substring(2,6).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400]  [update-line][color:yellow][>][color:reset] [CRACKING] SHA3-256 0xB2E1${Math.random().toString(16).substring(2,6).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400]  [update-line][color:yellow][>][color:reset] [CRACKING] SHA3-256 0xC9D4${Math.random().toString(16).substring(2,6).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400]  [update-line][color:yellow][>][color:reset] [CRACKING] SHA3-256 0xD8F2${Math.random().toString(16).substring(2,6).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400]  [update-line][color:yellow][>][color:reset] [CRACKING] SHA3-256 0xE5A3${Math.random().toString(16).substring(2,6).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400]  [update-line][color:yellow][>][color:reset] [CRACKING] SHA3-256 0xF1B7${Math.random().toString(16).substring(2,6).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400]  [update-line][color:yellow][>][color:reset] [CRACKING] SHA3-256 0x1AC9${Math.random().toString(16).substring(2,6).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400]  [update-line][color:yellow][>][color:reset] [CRACKING] SHA3-256 0x2BD4${Math.random().toString(16).substring(2,6).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400]  [update-line][color:yellow][>][color:reset] [CRACKING] SHA3-256 0x3CE8${Math.random().toString(16).substring(2,6).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400]  [update-line][color:yellow][>][color:reset] [CRACKING] SHA3-256 0x4DF1${Math.random().toString(16).substring(2,6).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400]  [update-line][color:yellow][>][color:reset] [CRACKING] SHA3-256 0x5E02${Math.random().toString(16).substring(2,6).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400]  [update-line][color:yellow][>][color:reset] [CRACKING] SHA3-256 0x6FA3${Math.random().toString(16).substring(2,6).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400]  [update-line][color:yellow][>][color:reset] [CRACKING] SHA3-256 0x7GB4${Math.random().toString(16).substring(2,6).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400]  [update-line][color:yellow][>][color:reset] [CRACKING] SHA3-256 0x8HC5${Math.random().toString(16).substring(2,6).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400]  [update-line][color:yellow][>][color:reset] [CRACKING] SHA3-256 0x9ID6${Math.random().toString(16).substring(2,6).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400]  [update-line][color:yellow][>][color:reset] [CRACKING] SHA3-256 0xAJE7${Math.random().toString(16).substring(2,6).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400]  [update-line][color:yellow][>][color:reset] [CRACKING] SHA3-256 0xBKF8${Math.random().toString(16).substring(2,6).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400]  [update-line][color:yellow][>][color:reset] [CRACKING] SHA3-256 0xCLG9${Math.random().toString(16).substring(2,6).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400]  [update-line][color:yellow][>][color:reset] [CRACKING] SHA3-256 0xDMH0${Math.random().toString(16).substring(2,6).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400]  [update-line][color:yellow][>][color:reset] [CRACKING] SHA3-256 0xENI1${Math.random().toString(16).substring(2,6).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400]  [update-line][color:yellow][>][color:reset] [CRACKING] SHA3-256 0xFOJ2${Math.random().toString(16).substring(2,6).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400]  [update-line][color:yellow][>][color:reset] [CRACKING] SHA3-256 0x0PK3${Math.random().toString(16).substring(2,6).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400]  [update-line][color:yellow][>][color:reset] [CRACKING] SHA3-256 0x1QL4${Math.random().toString(16).substring(2,6).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400]  [update-line][color:yellow][>][color:reset] [CRACKING] SHA3-256 0x2RM5${Math.random().toString(16).substring(2,6).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400]  [update-line][color:yellow][>][color:reset] [CRACKING] SHA3-256 0x3SN6${Math.random().toString(16).substring(2,6).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400]  [update-line][color:yellow][>][color:reset] [CRACKING] SHA3-256 0x4TO7${Math.random().toString(16).substring(2,6).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400]  [update-line][color:yellow][>][color:reset] [CRACKING] SHA3-256 0x5UP8${Math.random().toString(16).substring(2,6).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400]  [update-line][color:yellow][>][color:reset] [CRACKING] SHA3-256 0x6VQ9${Math.random().toString(16).substring(2,6).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400]  [update-line][color:yellow][>][color:reset] [CRACKING] SHA3-256 0x7WR0${Math.random().toString(16).substring(2,6).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400]  [update-line][color:yellow][>][color:reset] [CRACKING] SHA3-256 0x8XS1${Math.random().toString(16).substring(2,6).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:2500] [update-line][color:green][+][color:reset] [CRACKING] SHA3-256 0x${Math.random().toString(16).substring(2,10).toUpperCase()}... [color:green]KEY FOUND![color:reset]
[delay:3000] [color:cyan][*][color:reset] Encryption shattered after 30,847 iterations. Vault is OPEN.
[delay:2000] [color:cyan][*][color:reset] Extracting raw token fragments from sector 7G...
[delay:1500] [update-line][color:cyan][*][color:reset] Extracting fragments... [color:magenta]▓▓░░░░░░░░[color:reset] 20%
[delay:1500] [update-line][color:cyan][*][color:reset] Extracting fragments... [color:magenta]▓▓▓▓▓░░░░░[color:reset] 50%
[delay:1500] [update-line][color:cyan][*][color:reset] Extracting fragments... [color:magenta]▓▓▓▓▓▓▓▓░░[color:reset] 80%
[delay:1500] [update-line][color:cyan][*][color:reset] Extracting fragments... [color:magenta]▓▓▓▓▓▓▓▓▓▓[color:reset] 100%
[delay:2000] [color:cyan][*][color:reset] Recompiling 512-bit token from extracted fragments...
[delay:1500] [update-line][color:cyan][*][color:reset] Recompiling token... [color:magenta]▓▓▓░░░░░░░[color:reset] 30%
[delay:1500] [update-line][color:cyan][*][color:reset] Recompiling token... [color:magenta]▓▓▓▓▓▓░░░░[color:reset] 60%
[delay:2000] [update-line][color:cyan][*][color:reset] Recompiling token... [color:magenta]▓▓▓▓▓▓▓▓▓▓[color:reset] 100%
[delay:2500] [color:green][+][color:reset] Token compiled. Verifying against master distributed ledger...
[delay:1500] [update-line][color:cyan][*][color:reset] Ledger verification... [color:blue]■■□□□□□□□□[color:reset] 20% — Node: US-EAST
[delay:1500] [update-line][color:cyan][*][color:reset] Ledger verification... [color:blue]■■■■■□□□□□[color:reset] 50% — Node: EU-WEST
[delay:1500] [update-line][color:cyan][*][color:reset] Ledger verification... [color:blue]■■■■■■■■□□[color:reset] 80% — Node: ASIA-PAC
[delay:1500] [update-line][color:cyan][*][color:reset] Ledger verification... [color:blue]■■■■■■■■■■[color:reset] 100% — [color:green]VERIFIED[color:reset]
[delay:3000] 
[color:green]╔══════════════════════════════════════════════════════╗
║                                                      ║
║   [color:cyan]>>> ROOT PRIVILEGE TOKEN EXTRACTED <<<[color:green]             ║
║                                                      ║
║   Token  : [color:yellow]TKN-${Math.random().toString(36).substring(2,14).toUpperCase()}[color:green]        ║
║   Grade  : [color:red]OMEGA / UNRESTRICTED[color:green]                      ║
║   Issued : [color:cyan]${new Date().toISOString()}[color:green]  ║
║   Ledger : [color:cyan]SYNCHRONIZED (3/3 nodes)[color:green]                 ║
║                                                      ║
╚══════════════════════════════════════════════════════╝[color:reset]
[delay:2000] [color:cyan][*][color:reset] Token secured to local encrypted keystore.
[delay:1500] [color:cyan][*][color:reset] Synchronizing with 3 remote ledger nodes...
[delay:1000] [update-line][color:cyan][*][color:reset] Syncing nodes... [color:blue]■■■□□□□□□□[color:reset] 30% — Frankfurt
[delay:1200] [update-line][color:cyan][*][color:reset] Syncing nodes... [color:blue]■■■■■■□□□□[color:reset] 60% — Singapore
[delay:1500] [update-line][color:cyan][*][color:reset] Syncing nodes... [color:blue]■■■■■■■■■■[color:reset] 100% — [color:green]ALL NODES SYNCED[color:reset]
[delay:2000] [color:cyan][*][color:reset] Initiating counter-forensics cleanup...
[delay:1200] [update-line][color:cyan][*][color:reset] Scrubbing system logs...  [color:red]████░░░░░░[color:reset] 40%
[delay:1200] [update-line][color:cyan][*][color:reset] Scrubbing system logs...  [color:red]████████░░[color:reset] 80%
[delay:1000] [update-line][color:cyan][*][color:reset] Scrubbing system logs...  [color:red]██████████[color:reset] 100% — WIPED
[delay:1500] [color:cyan][*][color:reset] Overwriting bash history with null bytes...
[delay:1000] [color:cyan][*][color:reset] Flushing kernel audit buffer...
[delay:1500] [color:cyan][*][color:reset] Restoring original file timestamps...
[delay:1500] [color:cyan][*][color:reset] Wiping memory buffers and closing handles...
[delay:2500] [color:cyan][*][color:reset] Terminating Meterpreter session 1...
[delay:2000] [color:green][+][color:reset] All traces erased. Operation complete.
[delay:2000] [color:cyan][*][color:reset] Disconnecting session... [color:green]DONE.[color:reset]`;

      return NextResponse.json({ output: hackerOutput, delayTime: 0 });
    }

    // Check custom commands from DB
    const customCmd = await prisma.customCommand.findUnique({
      where: { commandName: command } 
    });

    if (customCmd) {
      await logCommand(true);
      return NextResponse.json({
        output: customCmd.expectedOutput,
        delayTime: customCmd.delayTime
      });
    }
    
    const customBaseCmd = await prisma.customCommand.findUnique({
      where: { commandName: baseCommand }
    });

    if (customBaseCmd) {
      await logCommand(true);
      return NextResponse.json({
        output: customBaseCmd.expectedOutput,
        delayTime: customBaseCmd.delayTime
      });
    }

    // Default not found
    await logCommand(false);
    return NextResponse.json({ output: null });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'System execution fault' }, { status: 500 });
  }
}
