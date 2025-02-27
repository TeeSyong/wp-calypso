import { HOSTED_SITE_MIGRATION_V2_FLOW, SITE_SETUP_FLOW } from '@automattic/onboarding';
import { translate } from 'i18n-calypso';
import { useSearchParams } from 'react-router-dom';
import { Primitive } from 'utility-types';
import { type Flow } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { addQueryArgs } from 'calypso/lib/url';
import { stepsWithRequiredLogin } from '../../utils/steps-with-required-login';
import { STEPS } from '../internals/steps';
import { ProvidedDependencies } from '../internals/types';

const { PLATFORM_IDENTIFICATION, PROCESSING, SITE_CREATION_STEP, SITE_MIGRATION_UPGRADE_PLAN } =
	STEPS;

export default {
	name: HOSTED_SITE_MIGRATION_V2_FLOW,
	get title() {
		return translate( 'Site Migration' );
	},
	isSignupFlow: false,
	useSteps() {
		return stepsWithRequiredLogin( [
			PLATFORM_IDENTIFICATION,
			SITE_CREATION_STEP,
			PROCESSING,
			SITE_MIGRATION_UPGRADE_PLAN,
		] );
	},

	useStepNavigation( currentStep, navigate ) {
		const [ query ] = useSearchParams();

		return {
			submit: ( props?: ProvidedDependencies ) => {
				const data = {
					platform: props?.platform || query.get( 'platform' ),
					siteId: props?.siteId || query.get( 'siteId' ),
					siteSlug: props?.siteSlug || query.get( 'siteSlug' ),
					next: props?.next || query.get( 'next' ),
					url: props?.url,
				} as Record< string, Primitive >;

				if ( currentStep === PLATFORM_IDENTIFICATION.slug ) {
					return navigate(
						addQueryArgs(
							{
								platform: data.platform,
								...( data.platform !== 'wordpress' ? { next: data.url } : {} ),
							},
							SITE_CREATION_STEP.slug
						)
					);
				}

				if ( currentStep === SITE_CREATION_STEP.slug ) {
					return navigate(
						addQueryArgs(
							{
								platform: data.platform,
								next: data.next,
							},
							PROCESSING.slug
						)
					);
				}

				if ( currentStep === PROCESSING.slug ) {
					if ( data?.next ) {
						return window.location.assign(
							addQueryArgs(
								{
									siteId: data?.siteId,
									siteSlug: data?.siteSlug,
								},
								`/setup/${ SITE_SETUP_FLOW }/${ data.next.toString() }`
							)
						);
					}

					return navigate(
						addQueryArgs(
							{
								siteId: data?.siteId,
								siteSlug: data?.siteSlug,
							},
							SITE_MIGRATION_UPGRADE_PLAN.slug
						)
					);
				}
			},
		};
	},
} satisfies Flow;
