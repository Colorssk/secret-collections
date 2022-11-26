import { useAccount, useConnect, useDisconnect  } from 'wagmi'
import Button from '@mui/material/Button';

export function Connect() {
  const { connector, isConnected } = useAccount()
  const { connect, connectors, error, isLoading, pendingConnector } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected) {
    return (
      <div>
        <Button onClick={disconnect} variant="outlined">Disconnect</Button>
      </div>
    )
  }
  return (
    <div>
      <div>
        {connectors
          .filter((x) => x.ready && x.id !== connector?.id)
          .map((x) => (
            <Button key={x.id} variant="outlined" onClick={() => connect({ connector: x })}>
              {x.name}
              {isLoading && x.id === pendingConnector?.id && ' (connecting)'}
            </Button>
          ))}
      </div>

      {error && <div>{error.message}</div>}
    </div>
  )
}
