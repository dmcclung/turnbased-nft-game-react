import React, { useEffect, useState } from 'react'
import './SelectCharacter.css'
import { contractAddress } from './constants'
import gameAbi from './Game.json'
import { BigNumber, ethers } from 'ethers'
import { Character } from './Character'

type SelectCharacterProps = {
    setCharacterNFT: (a: Character) => void;
}

type CharacterType = {
    name: string;
    image: string;
    hp: BigNumber;
    maxHp: BigNumber;
    xp: BigNumber;
    gold: BigNumber;
}

const SelectCharacter = ({ setCharacterNFT }: SelectCharacterProps) => {
  const [characters, setCharacters] = useState<Character[]>([])

  useEffect(() => {
    let canceled = false
    const getCharacterTypes = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, gameAbi.abi, signer)
        const characterTypes = await contract.getCharacterTypes()
        const cleanedCharacterTypes: Character[] = []
        characterTypes.forEach((characterType: CharacterType) => {
            cleanedCharacterTypes.push({
                name: characterType.name,
                image: characterType.image,
                hp: characterType.hp.toNumber(),
                maxHp: characterType.maxHp.toNumber(),
                xp: characterType.xp.toNumber(),
                gold: characterType.gold.toNumber(),
            })
        })
        if (!canceled) {
            setCharacters(cleanedCharacterTypes)
        }
    }

    getCharacterTypes()
    return () => {
        canceled = true
    }
  }, [])

  const mintPlayer = async (index: number) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, gameAbi.abi, signer)
    const tx = await contract.mintPlayer(index)
    await tx.wait()

    const character = contract.getPlayer()
    setCharacterNFT({
        name: character.name,
        image: character.image,
        xp: character.xp,
        hp: character.hp,
        maxHp: character.maxHp,
        gold: character.gold
    })
  }

  const renderCharacters = () => {
    return characters.map((character, index) => (
        <div className="character-item" key={character.name}>
        <div className="name-container">
            <p>{character.name}</p>
        </div>
        <img src={character.image} alt={character.name} />
        <button type="button" className="character-mint-button" onClick={() => mintPlayer(index)}>
            {`Mint ${character.name}`}
        </button>
        </div>
    ))
  }

  return (
    <div className="select-character-container">
      <h2>Mint Your Hero. Choose wisely.</h2>
      {characters.length > 0 && (
          <div className="character-grid">{renderCharacters()}</div>
      )}
    </div>
  )
}

export default SelectCharacter