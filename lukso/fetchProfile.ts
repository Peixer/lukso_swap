import { useEffect, useState } from 'react';

import { getInstance, UniversalProfileSchema } from './schemas';
import { Profile } from './types';

export const useProfile = (address: string): [Profile] => {
  const [profile, setProfile] = useState<Profile>(new Profile('', ''));

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileInstance = getInstance(
          UniversalProfileSchema,
          address as string
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