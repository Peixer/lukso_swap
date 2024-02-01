import { useEffect, useState } from 'react';

import { getInstance, UniversalProfileSchema } from './schemas';
import { Profile } from './types';
import { useConnectWallet } from '@web3-onboard/react';

export const useProfile = (address: string): [Profile] => {
  const [profile, setProfile] = useState<Profile>(new Profile('', ''));
  const [{ wallet }] = useConnectWallet();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileInstance = getInstance(
          UniversalProfileSchema,
          address as string,
          wallet
        );

        const result = await profileInstance.fetchData('LSP3Profile');
        const profileData = result.value;

        setProfile(new Profile(address, profileData));
      } catch (e) {
        console.log('error', e);
      }
    };

    if(address){
      fetchProfile();
    }

  }, [address]);

  return [profile];
};