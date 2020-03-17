/** @jsx jsx */
import { useState, useEffect } from 'react';
import Head from 'next/head';
import useMaker from '../hooks/useMaker';
import * as _ from 'lodash';
import { Text, jsx, Flex, Heading, Grid, Box, Spinner, Button } from 'theme-ui';
import AccountManager from '../components/FlopAccountManager';
import GuttedLayout from '../components/GuttedLayout';
import { AUCTION_DATA_FETCHER } from '../constants';
import AuctionsLayout from '../components/AuctionsLayout';
import IntroInfoCard from '../components/IntroInfoCard';
import IntroMDX from '../text/flopIntro.mdx';
import Footer from '../components/Footer';
import TermsConfirm from '../components/TermsConfirm';

const Index = () => {
  const { maker, web3Connected } = useMaker();
  const [auctions, setAuctions] = useState(null);
  const [lastSynced, updateLastSynced] = useState(undefined);
  const [TOCAccepted, setTOCAccepted] = useState(false);
  // console.log('mcd', IntroMDX)
  async function fetchAuctions() {
    const service = maker.service(AUCTION_DATA_FETCHER);

    const auctions = await service.fetchFlopAuctions();
    setAuctions(_.groupBy(auctions, auction => auction.auctionId));
  }

  useEffect(() => {
    if (web3Connected) {
      if (!auctions) {
        fetchAuctions();
      }
    }
  }, [web3Connected, auctions]);

  console.log(TOCAccepted, 'accet');
  return (
    <GuttedLayout>
      <Head>
        <title>Debt Auctions - Maker Auctions</title>
      </Head>
      {!maker ? (
        <Flex
          sx={{
            justifyContent: 'center',
            p: 8
          }}
        >
          <Spinner />
        </Flex>
      ) : (
        <>
          <Heading
            variant="h1"
            sx={{
              py: 7
            }}
          >
            Debt Auctions
          </Heading>

          <IntroInfoCard
            title={'How do debt auctions work?'}
            text={<IntroMDX />}
            action={
              TOCAccepted ? null : (
                <TermsConfirm
                  onConfirm={() => { setTOCAccepted(true);
                  }}
                />
              )
            }
          />
          <Box sx={{
            opacity: TOCAccepted ? 1 : 0.2,
            pointerEvents: TOCAccepted ? 'auto' : 'none'
          }}>
          <AccountManager web3Connected={web3Connected} />

          {!web3Connected ? null : (
            <Flex
              sx={{
                py: 4,
                alignItems: 'center'
              }}
            >
              <Text variant="h2">Active Auctions</Text>
              <Button
                variant="pill"
                sx={{ ml: 5 }}
                disabled={!web3Connected}
                onClick={() => fetchAuctions(true)}
              >
                Sync
              </Button>
              {lastSynced && (
                <Text title={lastSynced} sx={{ ml: 5, fontSize: 2 }}>
                  (Last synced: <Moment local>{lastSynced.getTime()}</Moment>)
                </Text>
              )}
            </Flex>
          )}
          {!web3Connected ? null : !auctions ? (
            <Flex
              sx={{
                justifyContent: 'center'
              }}
            >
              <Spinner />
            </Flex>
          ) : !Object.keys(auctions).length ? (
            <Flex>
              <Text variant="boldBody">
                No auctions found, check back later.
              </Text>
            </Flex>
          ) : (
            <AuctionsLayout auctions={auctions} type="flop" />

            // <AuctionsLayout auctions={auctions} type="flip" />
          )}
        </Box>

        </>
      )}
      {/* </Box> */}
      <Footer />
    </GuttedLayout>
  );
};

export default Index;
