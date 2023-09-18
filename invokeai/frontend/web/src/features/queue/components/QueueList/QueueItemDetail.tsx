import { ButtonGroup, Flex, Heading, Spinner, Text } from '@chakra-ui/react';
import IAIButton from 'common/components/IAIButton';
import DataViewer from 'features/gallery/components/ImageMetadataViewer/DataViewer';
import ScrollableContent from 'features/nodes/components/sidePanel/ScrollableContent';
import { useCancelBatch } from 'features/queue/hooks/useCancelBatch';
import { useCancelQueueItem } from 'features/queue/hooks/useCancelQueueItem';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FaTimes } from 'react-icons/fa';
import { useGetQueueItemQuery } from 'services/api/endpoints/queue';
import { SessionQueueItemDTO } from 'services/api/types';

type Props = {
  queueItemDTO: SessionQueueItemDTO;
};

const QueueItemComponent = ({ queueItemDTO }: Props) => {
  const { session_id, batch_id, item_id } = queueItemDTO;
  const { t } = useTranslation();
  const {
    cancelBatch,
    isLoading: isLoadingCancelBatch,
    isCanceled,
  } = useCancelBatch(batch_id);

  const { cancelQueueItem, isLoading: isLoadingCancelQueueItem } =
    useCancelQueueItem(item_id);

  const { data: queueItem } = useGetQueueItemQuery(item_id);

  const executionTime = useMemo(() => {
    if (!queueItem?.completed_at || !queueItem?.started_at) {
      if (queueItem?.status === 'in_progress') {
        return t('queue.inProgress');
      }
      return t('queue.pending');
    }
    const seconds = (
      (Date.parse(queueItem.completed_at) - Date.parse(queueItem.started_at)) /
      1000
    ).toFixed(2);
    return `${seconds}s`;
  }, [queueItem, t]);

  return (
    <Flex
      layerStyle="third"
      flexDir="column"
      p={2}
      pt={0}
      borderRadius="base"
      gap={2}
    >
      <Flex
        layerStyle="second"
        p={2}
        gap={2}
        justifyContent="space-between"
        alignItems="center"
        borderRadius="base"
      >
        <QueueItemData label="Item ID" data={item_id} />
        <QueueItemData label="Batch ID" data={batch_id} />
        <QueueItemData label="Session ID" data={session_id} />
        <QueueItemData label="Execution Time" data={executionTime} />
        <ButtonGroup size="xs" orientation="vertical">
          <IAIButton
            onClick={cancelQueueItem}
            isLoading={isLoadingCancelQueueItem}
            isDisabled={
              queueItem
                ? ['canceled', 'completed', 'failed'].includes(queueItem.status)
                : true
            }
            aria-label={t('queue.cancelItem')}
            icon={<FaTimes />}
            colorScheme="error"
          >
            {t('queue.cancelItem')}
          </IAIButton>
          <IAIButton
            onClick={cancelBatch}
            isLoading={isLoadingCancelBatch}
            isDisabled={isCanceled}
            aria-label={t('queue.cancelBatch')}
            icon={<FaTimes />}
            colorScheme="error"
          >
            {t('queue.cancelBatch')}
          </IAIButton>
        </ButtonGroup>
      </Flex>
      {queueItem?.error && (
        <Flex
          layerStyle="second"
          p={3}
          gap={1}
          justifyContent="space-between"
          alignItems="flex-start"
          borderRadius="base"
          flexDir="column"
        >
          <Heading size="sm" color="error.500" _dark={{ color: 'error.400' }}>
            Error
          </Heading>
          <pre>{queueItem.error}</pre>
        </Flex>
      )}
      <Flex
        layerStyle="second"
        h={512}
        w="full"
        borderRadius="base"
        alignItems="center"
        justifyContent="center"
      >
        {queueItem ? (
          <ScrollableContent>
            <DataViewer label="Queue Item" data={queueItem} />
          </ScrollableContent>
        ) : (
          <Spinner opacity={0.5} />
        )}
      </Flex>
    </Flex>
  );
};

export default memo(QueueItemComponent);

type QueueItemDataProps = { label: string; data: string };

const QueueItemData = ({ label, data }: QueueItemDataProps) => {
  return (
    <Flex flexDir="column" p={1} gap={1}>
      <Heading size="sm" color="base.400">
        {label}
      </Heading>
      <Text>{data}</Text>
    </Flex>
  );
};