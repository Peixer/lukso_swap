import { useEffect, useState } from 'react';

import { getInstance, UniversalProfileSchema } from './schemas';
import { Profile } from './types';
import { useConnectWallet } from '@web3-onboard/react';

export const useProfile = (): [Profile] => {
  const [profile, setProfile] = useState<Profile>(new Profile('', ''));
  const [{ wallet }] = useConnectWallet();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!wallet) return;
        const profileInstance = getInstance(
          UniversalProfileSchema,
          wallet.accounts[0].address as string,
          wallet?.provider
        );

        const result = await profileInstance.fetchData('LSP3Profile');
        const profileData = result.value;

        setProfile(new Profile(wallet.accounts[0].address, profileData));
      } catch (e) {
        console.log('error', e);
      }
    };

    fetchProfile();
  }, [wallet]);

  return [profile];
};