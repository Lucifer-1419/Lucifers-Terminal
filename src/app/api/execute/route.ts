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
      const connectOutput = `[delay:800] [color:cyan][*][color:reset] Resolving target host 'Lucifers_Server_v01'...
[delay:1200] [color:green][+][color:reset] Host resolved to [color:yellow]192.168.1.100[color:reset].
[delay:1000] [color:cyan][*][color:reset] Initiating secure handshake protocol...
[delay:1500] [color:yellow][>][color:reset] Bouncing signal through proxy layer 1 (Moscow)...
[delay:1200] [color:yellow][>][color:reset] Bouncing signal through proxy layer 2 (Reykjavik)...
[delay:1500] [color:yellow][>][color:reset] Bouncing signal through proxy layer 3 (Panama)...
[delay:1800] [color:green][+][color:reset] Signal bounced successfully. Target is ALIVE.
[delay:1000] [color:cyan][*][color:reset] Negotiating RSA-4096 encryption keys...
[delay:1500] [color:green][+][color:reset] Keys accepted. Exchanging certificates...
[delay:1200] [color:cyan][*][color:reset] Securing outbound connection port 443...
[delay:500] [color:green][+][color:reset] Connection to Lucifers_Server_v01 is SECURE.`;
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

      const hackerOutput = `[delay:800] [color:cyan][*][color:reset] Initializing MSF Exploit Framework...
[delay:1000] [color:cyan][*][color:reset] Scanning target ports and protocols...
[delay:1200] [color:green][+][color:reset] Port 443 (HTTPS) is OPEN. Vulnerability found in SSH daemon.
[delay:1500] [color:cyan][*][color:reset] Injecting memory payload...
[delay:400] [update-line][color:cyan][*][color:reset] Injecting memory payload... [###.................] 15%
[delay:400] [update-line][color:cyan][*][color:reset] Injecting memory payload... [#######.............] 35%
[delay:600] [update-line][color:cyan][*][color:reset] Injecting memory payload... [############........] 60%
[delay:500] [update-line][color:cyan][*][color:reset] Injecting memory payload... [#################...] 85%
[delay:400] [update-line][color:cyan][*][color:reset] Injecting memory payload... [####################] 100%
[delay:1000] [color:green][+][color:reset] Payload successfully injected into kernel space.
[delay:1200] [color:cyan][*][color:reset] Bypassing primary Neural-Net Firewall...
[delay:1500] [color:red][!][color:reset] WARNING: IDS detection spike detected!
[delay:1200] [color:yellow][>][color:reset] Rerouting packet transmission through Tor network...
[delay:1800] [color:green][+][color:reset] Reroute successful. Firewall bypassed.
[delay:1000] [color:cyan][*][color:reset] Initiating brute-force cryptographic hash extraction...
[delay:400] [update-line][color:yellow][>][color:reset] [CRACKING] 0x8F9B2A... FAILED
[delay:400] [update-line][color:yellow][>][color:reset] [CRACKING] 0x11C9D2... FAILED
[delay:400] [update-line][color:yellow][>][color:reset] [CRACKING] 0x7B22F1... FAILED
[delay:400] [update-line][color:yellow][>][color:reset] [CRACKING] 0x4A00B1... FAILED
[delay:400] [update-line][color:yellow][>][color:reset] [CRACKING] 0x9D8C7B... FAILED
[delay:1000] [update-line][color:green][+][color:reset] [CRACKING] 0xFF28D9... MATCH FOUND!
[delay:1500] [color:cyan][*][color:reset] Allocating secure seed...
[delay:1000] [color:cyan][*][color:reset] Generating token...
[delay:2000] 
[color:green]==============================================
  [color:cyan]ROOT PRIVILEGE TOKEN GRANTED:[color:reset] [color:yellow]TKN-${Math.random().toString(36).substring(2, 10).toUpperCase()}[color:reset]
[color:green]==============================================[color:reset]
[delay:800] 
[delay:800] [color:cyan][*][color:reset] Erasing event logs to cover tracks...
[delay:1000] [color:cyan][*][color:reset] Disconnecting session... DONE.`;

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
