# chat_config.py
import os
import json
from typing import Optional

CONFIG_FILE = "chat_config.json"


class ChatConfig:
    """Manage chat API configuration and Socratic prompts."""
    
    def __init__(self):
        self.config_file = CONFIG_FILE
        self.config = self._load_config()
    
    def _load_config(self):
        """Load configuration from file or create default."""
        if os.path.exists(self.config_file):
            with open(self.config_file, "r", encoding="utf-8") as f:
                return json.load(f)
        
        return {
            "default_socratic_prompt": None,
            "course_prompts": {},
            "chat_settings": {
                "default_max_tokens": 1024,
                "default_num_chunks": 5
            }
        }
    
    def _save_config(self):
        """Save configuration to file."""
        with open(self.config_file, "w", encoding="utf-8") as f:
            json.dump(self.config, f, indent=4, ensure_ascii=False)
    
    def set_default_socratic_prompt(self, prompt: str, save: bool = True):
        """Set the default Socratic prompting template."""
        self.config["default_socratic_prompt"] = prompt
        if save:
            self._save_config()
    
    def get_default_socratic_prompt(self) -> Optional[str]:
        """Get the default Socratic prompting template."""
        return self.config.get("default_socratic_prompt")
    
    def set_course_prompt(self, course_id: str, prompt: str, save: bool = True):
        """Set a custom Socratic prompt for a specific course."""
        if "course_prompts" not in self.config:
            self.config["course_prompts"] = {}
        
        self.config["course_prompts"][course_id] = prompt
        if save:
            self._save_config()
    
    def get_course_prompt(self, course_id: str) -> Optional[str]:
        """Get the Socratic prompt for a specific course."""
        return self.config.get("course_prompts", {}).get(course_id)
    
    def update_chat_settings(self, **kwargs):
        """Update chat settings like max_tokens, etc."""
        if "chat_settings" not in self.config:
            self.config["chat_settings"] = {}
        
        self.config["chat_settings"].update(kwargs)
        self._save_config()
    
    def get_chat_setting(self, key: str, default=None):
        """Get a specific chat setting."""
        return self.config.get("chat_settings", {}).get(key, default)
    
    def get_all_config(self):
        """Get entire configuration."""
        return self.config
    
    def print_config(self):
        """Print current configuration (useful for debugging)."""
        print(json.dumps(self.config, indent=4, ensure_ascii=False))
