from django.core.management.base import BaseCommand
from confluent_kafka import Consumer, KafkaException, KafkaError

class Command(BaseCommand):
    help = 'Kafka Consumer for Driver App'

    def handle(self, *args, **kwargs):
        # Kafka consumer configuration
        consumer_config = {
            'bootstrap.servers': 'localhost:9092',  # Kafka broker address
            'group.id': 'driver_group',       # Consumer group ID
            'auto.offset.reset': 'earliest',       # Start reading from the earliest message
        }

        # Create a Kafka consumer
        consumer = Consumer(consumer_config)
        topic = 'rides'
        consumer.subscribe([topic])

        self.stdout.write(self.style.SUCCESS(f"Subscribed to topic: {topic}"))


        try:
            while True:
                msg = consumer.poll(timeout=1.0)
                if msg is None:
                    continue
                if msg.error():
                    if msg.error().code() == KafkaError._PARTITION_EOF:
                        print(f"End of partition: {msg.topic()} [{msg.partition()}] at offset {msg.offset()}")
                    else:
                        raise KafkaException(msg.error())
                else:
                    # Process the message
                    print(f"Received message: {msg.value().decode('utf-8')}")
        except KeyboardInterrupt:
            print("Exiting Kafka consumer.")
        finally:
            consumer.close()