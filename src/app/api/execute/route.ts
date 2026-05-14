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
[delay:2000] [color:cyan][*][color:reset] Scanning target ports and protocols on 192.168.1.100...
[delay:3500] [color:magenta][+][color:reset] Port 443 (HTTPS) is OPEN. Vulnerability found in SSH daemon.
[delay:1500] [color:cyan][*][color:reset] Preparing reverse TCP handler on local port 4444...
[delay:2500] [color:cyan][*][color:reset] Injecting primary payload into memory...
[delay:800] [update-line][color:cyan][*][color:reset] Injecting payload... [color:blue]▰▱▱▱▱▱▱▱▱▱[color:reset] 10%
[delay:1200] [update-line][color:cyan][*][color:reset] Injecting payload... [color:blue]▰▰▰▱▱▱▱▱▱▱[color:reset] 30%
[delay:1500] [update-line][color:cyan][*][color:reset] Injecting payload... [color:blue]▰▰▰▰▰▰▱▱▱▱[color:reset] 60%
[delay:1000] [update-line][color:cyan][*][color:reset] Injecting payload... [color:blue]▰▰▰▰▰▰▰▰▱▱[color:reset] 85%
[delay:1200] [update-line][color:cyan][*][color:reset] Injecting payload... [color:blue]▰▰▰▰▰▰▰▰▰▰[color:reset] 100%
[delay:2000] [color:green][+][color:reset] Payload successfully injected into kernel space. Meterpreter session 1 opened.
[delay:2500] [color:cyan][*][color:reset] Analyzing primary Neural-Net Firewall architecture...
[delay:1500] [update-line][color:cyan][*][color:reset] Decrypting firewall rules... [color:yellow]▓░░░░░░░░░[color:reset] 12%
[delay:1200] [update-line][color:cyan][*][color:reset] Decrypting firewall rules... [color:yellow]▓▓▓░░░░░░░[color:reset] 34%
[delay:1500] [update-line][color:cyan][*][color:reset] Decrypting firewall rules... [color:yellow]▓▓▓▓▓▓░░░░[color:reset] 68%
[delay:1800] [update-line][color:cyan][*][color:reset] Decrypting firewall rules... [color:yellow]▓▓▓▓▓▓▓▓▓▓[color:reset] 100%
[delay:2000] [color:green][+][color:reset] Firewall rules analyzed. Initiating bypass...
[delay:3000] [color:red][!][color:reset] WARNING: IDS detection spike detected! Active tracking engaged!
[delay:2000] [color:yellow][>][color:reset] Deploying anti-forensics daemon to block tracking...
[delay:3000] [color:yellow][>][color:reset] Rerouting packet transmission through deep-onion Tor network...
[delay:2500] [color:green][+][color:reset] Reroute successful. Firewall bypassed. Connection obfuscated.
[delay:2500] [color:cyan][*][color:reset] Initiating Deep-Scan on Security Rings...
[delay:1500] [color:yellow][>][color:reset] Penetrating Ring 1 (External Routing)... [color:green]SUCCESS[color:reset]
[delay:1800] [color:yellow][>][color:reset] Penetrating Ring 2 (Logic Nodes)... [color:green]SUCCESS[color:reset]
[delay:2500] [color:yellow][>][color:reset] Penetrating Ring 3 (Core Kernel)... [color:green]SUCCESS[color:reset]
[delay:2000] [color:cyan][*][color:reset] Navigating to secure token vault sector 7G...
[delay:2500] [color:cyan][*][color:reset] Vault locked. Initiating brute-force cryptographic hash extraction...
[delay:400] [update-line][color:yellow][>][color:reset] [CRACKING] MD5 0x${Math.random().toString(16).substring(2, 8).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400] [update-line][color:yellow][>][color:reset] [CRACKING] MD5 0x${Math.random().toString(16).substring(2, 8).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400] [update-line][color:yellow][>][color:reset] [CRACKING] MD5 0x${Math.random().toString(16).substring(2, 8).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400] [update-line][color:yellow][>][color:reset] [CRACKING] MD5 0x${Math.random().toString(16).substring(2, 8).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400] [update-line][color:yellow][>][color:reset] [CRACKING] MD5 0x${Math.random().toString(16).substring(2, 8).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400] [update-line][color:yellow][>][color:reset] [CRACKING] MD5 0x${Math.random().toString(16).substring(2, 8).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400] [update-line][color:yellow][>][color:reset] [CRACKING] MD5 0x${Math.random().toString(16).substring(2, 8).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400] [update-line][color:yellow][>][color:reset] [CRACKING] MD5 0x${Math.random().toString(16).substring(2, 8).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400] [update-line][color:yellow][>][color:reset] [CRACKING] MD5 0x${Math.random().toString(16).substring(2, 8).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400] [update-line][color:yellow][>][color:reset] [CRACKING] MD5 0x${Math.random().toString(16).substring(2, 8).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400] [update-line][color:yellow][>][color:reset] [CRACKING] MD5 0x${Math.random().toString(16).substring(2, 8).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400] [update-line][color:yellow][>][color:reset] [CRACKING] MD5 0x${Math.random().toString(16).substring(2, 8).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400] [update-line][color:yellow][>][color:reset] [CRACKING] MD5 0x${Math.random().toString(16).substring(2, 8).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400] [update-line][color:yellow][>][color:reset] [CRACKING] MD5 0x${Math.random().toString(16).substring(2, 8).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400] [update-line][color:yellow][>][color:reset] [CRACKING] MD5 0x${Math.random().toString(16).substring(2, 8).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400] [update-line][color:yellow][>][color:reset] [CRACKING] MD5 0x${Math.random().toString(16).substring(2, 8).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400] [update-line][color:yellow][>][color:reset] [CRACKING] MD5 0x${Math.random().toString(16).substring(2, 8).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400] [update-line][color:yellow][>][color:reset] [CRACKING] MD5 0x${Math.random().toString(16).substring(2, 8).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400] [update-line][color:yellow][>][color:reset] [CRACKING] MD5 0x${Math.random().toString(16).substring(2, 8).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:400] [update-line][color:yellow][>][color:reset] [CRACKING] MD5 0x${Math.random().toString(16).substring(2, 8).toUpperCase()}... [color:red]FAILED[color:reset]
[delay:2000] [update-line][color:green][+][color:reset] [CRACKING] MD5 0x${Math.random().toString(16).substring(2, 8).toUpperCase()}... [color:green]MATCH FOUND![color:reset]
[delay:3000] [color:cyan][*][color:reset] Encryption key shattered. Vault is OPEN.
[delay:2000] [color:cyan][*][color:reset] Extracting raw token fragments...
[delay:1500] [update-line][color:cyan][*][color:reset] Recompiling fragments... [color:magenta]▓▓▓░░░░░░░[color:reset] 30%
[delay:1500] [update-line][color:cyan][*][color:reset] Recompiling fragments... [color:magenta]▓▓▓▓▓▓░░░░[color:reset] 60%
[delay:2000] [update-line][color:cyan][*][color:reset] Recompiling fragments... [color:magenta]▓▓▓▓▓▓▓▓▓▓[color:reset] 100%
[delay:3000] [color:green][+][color:reset] Token successfully compiled and verified against master ledger.
[delay:3000] 
[color:green]██████████████████████████████████████████████████████
█                                                    █
█     [color:cyan]>>> ROOT PRIVILEGE TOKEN EXTRACTED <<<<[color:green]        █
█                                                    █
█          [color:yellow]TKN-${Math.random().toString(36).substring(2, 12).toUpperCase()}[color:green]                      █
█                                                    █
██████████████████████████████████████████████████████[color:reset]
[delay:2000] 
[delay:1500] [color:cyan][*][color:reset] Token secured to local ledger.
[delay:1500] [color:cyan][*][color:reset] Synchronizing remote ledgers...
[delay:1000] [update-line][color:cyan][*][color:reset] Syncing nodes... [color:blue]■■■□□□□□□□[color:reset] 30%
[delay:1200] [update-line][color:cyan][*][color:reset] Syncing nodes... [color:blue]■■■■■■■□□□[color:reset] 70%
[delay:1500] [update-line][color:cyan][*][color:reset] Syncing nodes... [color:blue]■■■■■■■■■■[color:reset] 100%
[delay:2000] [color:cyan][*][color:reset] Erasing event logs to cover tracks...
[delay:1200] [update-line][color:cyan][*][color:reset] Scrubbing logs... [color:red]████░░░░░░[color:reset] 40%
[delay:1200] [update-line][color:cyan][*][color:reset] Scrubbing logs... [color:red]████████░░[color:reset] 80%
[delay:1000] [update-line][color:cyan][*][color:reset] Scrubbing logs... [color:red]██████████[color:reset] 100%
[delay:1500] [color:cyan][*][color:reset] Wiping memory buffers...
[delay:2500] [color:cyan][*][color:reset] Disconnecting session... [color:green]DONE.[color:reset]`;

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
