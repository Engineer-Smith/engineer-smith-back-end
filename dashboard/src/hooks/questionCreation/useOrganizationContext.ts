// src/hooks/questionCreation/useOrganizationContext.ts
import { useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { QuestionCreationAction } from './types';

export const useOrganizationContext = (
  dispatch: React.Dispatch<QuestionCreationAction>
) => {
  const { user } = useAuth();

  // Initialize organization context from authenticated user
  const initializeOrganizationContext = useCallback(() => {
    if (!user) {
      console.warn('User not available for question creation initialization');
      return;
    }

    if (!user.organization) {
      console.warn('User organization data not available for question creation');
      return;
    }

    const isSuperOrg = user.organization.isSuperOrg || false;
    const canCreateGlobal = isSuperOrg; // Super org users can create global content
    
    dispatch({
      type: 'SET_USER_ORG_INFO',
      payload: {
        organizationId: user.organizationId,
        organizationName: user.organization.name,
        isSuperOrg,
        canCreateGlobal
      }
    });

  }, [user, dispatch]);

  const toggleGlobalQuestion = useCallback(() => {
    if (!user?.organization?.isSuperOrg) {
      console.warn('Only super organization users can toggle global question setting');
      return;
    }
    dispatch({ type: 'TOGGLE_GLOBAL_QUESTION' });
  }, [dispatch, user]);

  return {
    initializeOrganizationContext,
    toggleGlobalQuestion,
    userOrganization: user?.organization,
    isSuperOrgUser: user?.organization?.isSuperOrg || false,
    canCreateGlobal: user?.organization?.isSuperOrg || false,
    organizationName: user?.organization?.name
  };
};