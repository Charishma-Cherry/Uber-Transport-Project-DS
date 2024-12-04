from confluent_kafka import Producer
import simplejson as json
def send_message(topic, data):

    # Initialize Kafka producer
    producer = Producer({'bootstrap.servers': 'localhost:9092'})
    producer.produce(topic, value=json.dumps(data))
    producer.flush()