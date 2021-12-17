import { BigNumber, Contract, ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { contractAddress } from './constants'
import { Character } from './Character'
import gameAbi from './Game.json'

const Arena = () => {
    const [contract, setContract] = useState<Contract>()
    const [boss, setBoss] = useState<Character>()
    const [player, setPlayer] = useState<Character>()
    const [attackState, setAttackState] = useState<string>('')

    useEffect(() => {
        const setupContract = async () => {
            const { ethereum } = window
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum)
                const signer = provider.getSigner()
                setContract(
                    new ethers.Contract(contractAddress, gameAbi.abi, signer)
                )
            } else {
                console.log('Problem getting ethereum')
            }
        }

        setupContract()
    }, [])

    useEffect(() => {
        const getPlayer = async () => {
            if (contract) {
                const playerNft = await contract.getPlayer()
                setPlayer(playerNft)
            }
        }

        const onPlayerContinued = () => {
          console.log('PlayerContinued')
          getPlayer()
        }

        if (contract) {
          getPlayer()

          contract.on('PlayerContinued', onPlayerContinued)
        }

        return () => {
          if (contract) {
            contract.off('PlayerContinued', onPlayerContinued)
          }
        }
    }, [contract])

    useEffect(() => {
        const getBoss = async () => {
            if (contract) {
                const bossNft = await contract.getBoss()
                setBoss(bossNft)
            }
        }

        const onAttackComplete = (newBossHp: BigNumber, newPlayerHp: BigNumber) => {
            const bossHp = newBossHp.toNumber()
            const playerHp = newPlayerHp.toNumber()

            console.log(`AttackComplete: Boss Hp: ${bossHp} Player Hp: ${playerHp}`)

            setBoss((prevState: Character | undefined) => {
                if (prevState) {
                    const newState: Character = {
                        name: prevState.name,
                        image: prevState.image,
                        hp: bossHp,
                        maxHp: prevState.maxHp,
                        xp: prevState.xp,
                        gold: prevState.gold
                    }
                    return newState
                }
            })

            setPlayer((prevState: Character | undefined) => {
                if (prevState) {
                    const newState: Character = {
                        name: prevState.name,
                        image: prevState.image,
                        hp: playerHp,
                        maxHp: prevState.maxHp,
                        xp: prevState.xp,
                        gold: prevState.gold
                    }
                    return newState
                }
            })
        }

        if (contract) {
            getBoss()
            contract.on('AttackComplete', onAttackComplete)
        }

        return () => {
            if (contract) {
                contract.off('AttackComplete', onAttackComplete)
            }
        }
    }, [contract])

    const attack = async () => {
        try {
            if (contract) {
              setAttackState('attacking')
              console.log('Attacking boss...')
              const attackTxn = await contract.attackBoss()
              await attackTxn.wait()
              console.log('attackTxn:', attackTxn)
              setAttackState('hit')
            }
          } catch (error) {
            console.error('Error attacking boss:', error)
            setAttackState('')
          }
    }

    const continuePlayer = async () => {
      if (contract) {
        try {
          const txn = await contract.continuePlayer()
          await txn.wait()
        } catch (err) {
          console.log(err)
        }
      }
    }

    // TODO: Need to revive and improve progress bars

    const getHpProgressStyle = (hp: number, maxHp: number) => {
      const hpRemaining = (hp / maxHp) * 100
      return hpRemaining >= 50 ? 'nes-progress is-success' :
      hpRemaining >= 30 ? 'nes-progress is-warning' :
      'nes-progress is-error'
    }

    return <div className="arena-container">
      {boss && (
          <div className="boss-container">
          <div className={`boss-content ${attackState}`}>
            <h2 style={{color: 'white'}}>🔥 {boss.name} 🔥</h2>
            <div className="image-content">
              <img src={boss.image} alt={`Boss ${boss.name}`} />
              <div className="health-bar">
                <progress className={getHpProgressStyle(boss.hp, boss.maxHp)} value={boss.hp} max={boss.maxHp} />
                <p style={{color: 'white'}}>{`${boss.hp} HP / ${boss.xp} XP / ${boss.gold} Gold`}</p>
              </div>
            </div>
          </div>
          <div className="attack-container">
            <button className="nes-btn" onClick={() => attack()}>
              {`💥 Attack ${boss.name}`}
            </button>
          </div>
        </div>
      )}

      {player && (
          <div className="players-container">
          <div style={{margin: '30px'}} className="player-container">
            <h2 style={{color: 'white'}}>Your Character</h2>
            <div className="player">
              <div className="image-content">
                <h2 style={{color: 'white'}}>{player.name}</h2>
                <img
                  src={player.image}
                  alt={`Character ${player.name}`}
                />
                <div className="health-bar">
                  <progress className={getHpProgressStyle(player.hp, player.maxHp)} value={player.hp} max={player.maxHp} />
                  <p style={{color: 'white'}}>{`${player.hp} HP / ${player.xp} XP / ${player.gold} Gold`}</p>
                </div>
              </div>
              {player.hp === 0 &&
                <div>
                  <p style={{color: 'white'}}>You have fainted</p>
                  <button className="nes-btn" onClick={() => continuePlayer()}>
                    {`❤️ Continue`}
                  </button>
                </div>
              }
              <div className="stats">
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
}

export default Arena