from django.contrib.auth.tokens import PasswordResetTokenGenerator
import six
from datetime import datetime, timedelta

class AccountActivationTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        # Use the actual timestamp parameter to allow proper expiration
        return (
            six.text_type(user.pk) + six.text_type(timestamp) +
            six.text_type(user.is_active)
        )

account_activation_token = AccountActivationTokenGenerator()