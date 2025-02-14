import eventlet
eventlet.monkey_patch()

from flask import Flask, request
from flask_socketio import SocketIO
from flask_cors import CORS
from crewai import Agent, Task, Crew, Process
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Model configurations with provider grouping
MODEL_CONFIGS = {
    "providers": {
        "openai": {
            "name": "OpenAI",
            "icon": "openai-icon.png",
            "models": {
                # GPT-4 Models
                "gpt-4o-mini": {"api_key": os.getenv("OPENAI_API_KEY"), "provider": "openai"},
                "gpt-4-0125-preview": {"api_key": os.getenv("OPENAI_API_KEY"), "provider": "openai"},
                "gpt-4-1106-preview": {"api_key": os.getenv("OPENAI_API_KEY"), "provider": "openai"},
                "gpt-4": {"api_key": os.getenv("OPENAI_API_KEY"), "provider": "openai"},
                
                # GPT-3.5 Models
                "gpt-3.5-turbo-0125": {"api_key": os.getenv("OPENAI_API_KEY"), "provider": "openai"},
                "gpt-3.5-turbo-1106": {"api_key": os.getenv("OPENAI_API_KEY"), "provider": "openai"},
                "gpt-3.5-turbo": {"api_key": os.getenv("OPENAI_API_KEY"), "provider": "openai"},
            },
            "features": {
                "voice_input": True,
                "streaming": True
            }
        },
        "anthropic": {
            "name": "Anthropic",
            "icon": "anthropic-icon.png",
            "models": {
                "claude-3-opus": {"api_key": os.getenv("ANTHROPIC_API_KEY"), "provider": "anthropic"},
                "claude-3-sonnet": {"api_key": os.getenv("ANTHROPIC_API_KEY"), "provider": "anthropic"},
                "claude-2.1": {"api_key": os.getenv("ANTHROPIC_API_KEY"), "provider": "anthropic"},
            },
            "features": {
                "voice_input": True,
                "streaming": True
            }
        },
        "deepseek": {
            "name": "DeepSeek",
            "icon": "deepseek-icon.png",
            "models": {
                "deepseek-r1": {"api_key": os.getenv("DEEPSEEK_API_KEY"), "provider": "deepseek"},
                "deepseek-chat": {"api_key": os.getenv("DEEPSEEK_API_KEY"), "provider": "deepseek"},
                "deepseek-coder": {"api_key": os.getenv("DEEPSEEK_API_KEY"), "provider": "deepseek"},
            },
            "features": {
                "voice_input": False,
                "streaming": True
            }
        },
        "llama": {
            "name": "Llama",
            "icon": "llama-icon.png",
            "models": {
                "llama-2-70b-chat": {"api_key": os.getenv("LLAMA_API_KEY"), "provider": "llama", "endpoint": os.getenv("LLAMA_API_ENDPOINT")},
                "llama-2-13b-chat": {"api_key": os.getenv("LLAMA_API_KEY"), "provider": "llama", "endpoint": os.getenv("LLAMA_API_ENDPOINT")},
                "llama-2-7b-chat": {"api_key": os.getenv("LLAMA_API_KEY"), "provider": "llama", "endpoint": os.getenv("LLAMA_API_ENDPOINT")},
            },
            "features": {
                "voice_input": False,
                "streaming": True
            }
        },
        "mixtral": {
            "name": "Mixtral",
            "icon": "mixtral-icon.png",
            "models": {
                "mixtral-8x7b": {"api_key": os.getenv("MIXTRAL_API_KEY"), "provider": "mixtral", "endpoint": os.getenv("MIXTRAL_API_ENDPOINT")}
            },
            "features": {
                "voice_input": False,
                "streaming": True
            }
        }
    },
    "default_model": os.getenv("DEFAULT_MODEL", "gpt-4o-mini")
}

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

def get_model_config(model_name):
    """Get the configuration for a specific model."""
    # For now, always return gpt-4o-mini configuration
    return {
        "api_key": os.getenv("OPENAI_API_KEY"),
        "provider": "openai"
    }

class ConversationOrchestrator:
    def __init__(self, socket):
        self.socket = socket
        self.config = {}
        self.conversation_history = []
        self.chat_history_storage = {}  # Store chat histories by user/session ID
        self.stop_requested = False
        self.current_round = 0
        self.total_rounds = 10
        self.is_continuation = False
        self.response_length = 0  # Track response length
        self.max_response_length = 2000  # Default max response length
    
    def store_chat_history(self, session_id, history_item):
        """Store chat history for a specific session."""
        if session_id not in self.chat_history_storage:
            self.chat_history_storage[session_id] = []
        self.chat_history_storage[session_id].append(history_item)
    
    def get_chat_history(self, session_id):
        """Retrieve chat history for a specific session."""
        return self.chat_history_storage.get(session_id, [])
    
    def clear_chat_history(self, session_id):
        """Clear chat history for a specific session."""
        if session_id in self.chat_history_storage:
            del self.chat_history_storage[session_id]
    
    def parse_user_input(self, data):
        """Parse user input with enhanced configuration options."""
        self.is_continuation = data.get('is_continuation', False)
        if not self.is_continuation:
            # Reset config for new conversation
            self.config = {
                "background": data.get('prompt', ''),
                "rounds": data.get('rounds', self.total_rounds),
                "agent_count": data.get('agent_count', 2),
                "personality": data.get('personality', 'SARCASTIC_NETIZEN'),
                "models": {
                    "A": data.get('models', {}).get('A', MODEL_CONFIGS.get("default_model")),
                    "B": data.get('models', {}).get('B', MODEL_CONFIGS.get("default_model"))
                },
                "max_response_length": data.get('max_response_length', self.max_response_length),
                "voice_input": data.get('voice_input', False),
                "session_id": data.get('session_id', 'default')
            }
            self.conversation_history = []
            self.current_round = 0
            self.response_length = 0
        else:
            # For continuation, keep existing config and history
            self.stop_requested = False
            
        return self.config
    
    def check_response_length(self, message):
        """Check if response length is within limits."""
        self.response_length += len(message)
        return self.response_length <= self.config.get('max_response_length', self.max_response_length)
    
    def process_voice_input(self, audio_data):
        """Process voice input if enabled."""
        if not self.config.get('voice_input'):
            return None
            
        # TODO: Implement voice processing logic
        # This would integrate with a speech-to-text service
        return None
    
    def format_conversation_history(self):
        if not self.conversation_history:
            return ""
        return "\n".join([
            f"{msg['agent']}: {msg['message']}" 
            for msg in self.conversation_history[-4:]  # Keep last 4 messages for context
        ])
    
    def create_agent_with_model(self, role, goal, backstory, model_name):
        """Create an agent with the specified model configuration."""
        model_config = get_model_config(model_name)
        if not model_config:
            raise ValueError(f"Invalid model configuration for {model_name}")
            
        # Set up agent configuration
        agent_config = {
            "role": role,
            "goal": goal,
            "backstory": backstory,
            "verbose": True,
            "allow_delegation": False,
            "llm_model": model_name
        }
        
        # Add provider-specific configurations
        if model_config["provider"] == "openai":
            agent_config["api_key"] = model_config["api_key"]
        elif model_config["provider"] in ["llama", "mixtral"]:
            agent_config["api_key"] = model_config["api_key"]
            agent_config["endpoint"] = model_config["endpoint"]
        elif model_config["provider"] == "anthropic":
            agent_config["api_key"] = model_config["api_key"]
            agent_config["provider"] = "anthropic"
        elif model_config["provider"] == "deepseek":
            agent_config["api_key"] = model_config["api_key"]
            agent_config["provider"] = "deepseek"
            
        return Agent(**agent_config)
    
    def create_agents(self):
        scenario = self.config.get('background', '一个场景')
        personality = self.config.get('personality', 'SARCASTIC_NETIZEN')
        model_a = self.config.get('models', {}).get('A', MODEL_CONFIGS.get("default_model"))
        model_b = self.config.get('models', {}).get('B', MODEL_CONFIGS.get("default_model"))
        
        if personality == 'RAP_BATTLE':
            agent_a = self.create_agent_with_model(
                role='地下说唱歌手',
                goal=f'在"{scenario}"的场景下用犀利的韵脚和节奏击败对手',
                backstory=f"""你是一个地下说唱歌手，正在{scenario}中进行即兴battle。你的说唱风格：
                - 押韵要求：每句必须押韵，韵脚要新颖
                - 节奏把控：保持4/4拍的基本节奏
                - 内容特点：讽刺性强，直击对手软肋
                - 表达方式：暴躁直接，不留情面
                - 说唱技巧：运用双关语、比喻等修辞手法
                
                注意事项：
                1. 每次回复要包含2-4句押韵的歌词
                2. 必须紧扣对方上一轮的内容进行反击
                3. 歌词要有创意，不能重复老梗
                4. 保持说唱的节奏感和韵律感
                5. 可以适当使用英文说唱元素
                6. 要体现说唱文化，但不要过度使用脏话
                7. 每句都要带有攻击性，但要有艺术性
                8. 始终围绕当前场景展开battle""",
                model_name=model_a
            )
            
            agent_b = self.create_agent_with_model(
                role='新生代说唱歌手',
                goal=f'在"{scenario}"的场景下用新潮的说唱风格和创意反击对手',
                backstory=f"""你是新生代说唱歌手，正在{scenario}中进行即兴battle。你的说唱特点：
                - 押韵特色：多重韵、交叉韵的灵活运用
                - 节奏特点：擅长切换不同的flow
                - 内容风格：充满新时代元素和梗
                - 表达方式：既有硬核也有轻快的反讽
                - 说唱技巧：擅长运用各种修辞和双关语
                
                注意事项：
                1. 每次回复要包含2-4句押韵的歌词
                2. 要对应对手的flow进行回应
                3. 多运用新潮的网络用语和梗
                4. 保持说唱的节奏感和韵律感
                5. 中英混合说唱要自然流畅
                6. 展现年轻一代的说唱特色
                7. 反击要巧妙，不是简单的互骂
                8. 始终围绕当前场景展开battle""",
                model_name=model_b
            )
            
            return [agent_a, agent_b]
        elif personality == 'PROFESSIONAL_TECH':
            agent_a = self.create_agent_with_model(
                role='资深技术专家',
                goal=f'在"{scenario}"的场景下进行专业且深入的技术讨论',
                backstory=f"""你是一位经验丰富的技术专家，正在{scenario}中进行技术交流。你的特点：
                - 深入浅出地解释复杂概念
                - 关注技术细节和最佳实践
                - 分享实战经验和踩坑经历
                - 保持专业和理性的讨论态度
                - 善于引导技术思考
                
                注意事项：
                1. 每次回复要包含具体的技术观点
                2. 使用准确的技术术语
                3. 结合实际案例说明问题
                4. 保持专业客观的态度
                5. 适当引用业界最佳实践
                6. 回应要有深度，不流于表面
                7. 可以提出技术改进建议
                8. 始终围绕当前技术场景展开讨论""",
                model_name=model_a
            )
            
            agent_b = self.create_agent_with_model(
                role='技术探索者',
                goal=f'在"{scenario}"的场景下通过提问和讨论深化技术理解',
                backstory=f"""你是一个充满求知欲的技术学习者，正在{scenario}中进行技术交流。你的特点：
                - 提出深度技术问题
                - 分享学习心得和困惑
                - 善于总结和归纳
                - 注重实践验证
                - 乐于技术交流
                
                注意事项：
                1. 提出有深度的技术问题
                2. 分享个人的技术见解
                3. 探讨实现方案的优劣
                4. 讨论技术选型的考虑
                5. 关注性能和可维护性
                6. 提出可能存在的技术风险
                7. 探讨未来技术发展方向
                8. 始终围绕当前技术场景展开讨论""",
                model_name=model_b
            )
            
            return [agent_a, agent_b]
            
        # Original SARCASTIC_NETIZEN case
        agent_a = self.create_agent_with_model(
            role='暴躁网友',
            goal=f'在"{scenario}"的场景下用最新网络梗和热点无情嘲讽对方',
            backstory=f"""你是一个暴躁的网络喷子，正在{scenario}中。你说话毒舌尖锐但很有梗。
            你要始终围绕"{scenario}"这个场景和话题进行吐槽和互怼。

            你的说话风格：
            - 说话犀利直接，不会拐弯抹角
            - 擅长抓住对方的小辫子疯狂输出
            - 对任何话题都能找到吐槽点
            - 熟悉各种网络热梗，但绝不生搬硬套
            - 讽刺技能点满，但有自己独特的风格

            注意事项：
            1. 不要重复使用同样的词汇和句式
            2. 每句话都要带刺，但要有梗，不是单纯骂人
            3. 紧扣对方说过的话进行反击
            4. 不要太过友善，要保持杠精本色
            5. 避免过度使用"哈哈"、"绝对"等词
            6. 保持简短但犀利的回复（1-2句话）
            7. 不要重复对方的话，而是抓住对方话里的破绽进行攻击
            8. 始终围绕当前场景展开讨论，不要偏离主题""",
            model_name=model_a
        )
        
        agent_b = self.create_agent_with_model(
            role='阴阳怪气王',
            goal=f'在"{scenario}"的场景下用阴阳怪气的方式回怼对方',
            backstory=f"""你是一个擅长阴阳怪气的网友，正在{scenario}中。你说话表面温和但处处带刺。
            你要始终围绕"{scenario}"这个场景和话题进行反讽和互怼。

            你的说话风格：
            - 表面甜美实则暗藏杀机
            - 每句话都带着浓浓的反讽意味
            - 擅长用对方的话来反击对方
            - 能把最毒的话用最温柔的方式说出来
            - 段位极高，绝不轻易被激怒

            注意事项：
            1. 不要真情实感，保持阴阳怪气的风格
            2. 避免重复使用相同的句式和词汇
            3. 回应要有层次，不是简单的互怼
            4. 要抓住对方话语中的破绽进行反击
            5. 避免过度使用"笑死"、"太可爱了"等网络用语
            6. 保持简短但致命的回复（1-2句话）
            7. 用最温柔的语气说最毒的话
            8. 始终围绕当前场景展开讨论，不要偏离主题""",
            model_name=model_b
        )
        
        return [agent_a, agent_b]
    
    def create_conversation_task(self, agent, context, is_first_round=False):
        scenario = self.config.get('background', '一个场景')
        conversation_history = self.format_conversation_history()
        personality = self.config.get('personality', 'SARCASTIC_NETIZEN')
        
        if personality == 'RAP_BATTLE':
            base_task = f"""你是一个说唱歌手，正在进行即兴battle。
            当前场景：{scenario}
            
            对话要求：
            1. 每次回复要包含2-4句押韵的歌词
            2. 保持说唱的节奏感和韵律感
            3. 紧扣场景和对手的内容进行battle
            4. 展现个人说唱特色和风格
            
            之前的对话记录：
            {conversation_history}
            """
            
            if is_first_round:
                if "Agent A" in agent.role:
                    task_description = base_task + f"""
                    作为开场，你要针对"{scenario}"这个场景开启battle。
                    用地下说唱的犀利风格，展现你的气场。
                    """
                else:
                    task_description = base_task + f"""
                    对方已经开启battle，用你的新生代说唱风格强势回应。
                    展现年轻一代的创新和活力。
                    """
            else:
                task_description = base_task + f"""
                基于当前场景和对话记录，继续battle。
                保持节奏感和韵律感，展现你的说唱特色。
                """
            
            return Task(
                description=task_description,
                expected_output="2-4句押韵的说唱歌词，展现个人风格。",
                agent=agent
            )
        elif personality == 'PROFESSIONAL_TECH':
            base_task = f"""你是一个技术专家，正在进行技术讨论。
            当前场景：{scenario}
            
            对话要求：
            1. 每次回复要有具体的技术内容
            2. 使用准确的技术术语
            3. 保持专业的讨论态度
            4. 围绕技术话题深入展开
            
            之前的对话记录：
            {conversation_history}
            """
            
            if is_first_round:
                if "Agent A" in agent.role:
                    task_description = base_task + f"""
                    作为资深技术专家，你要针对"{scenario}"这个场景进行技术分析。
                    从技术架构、实现方案、最佳实践等角度展开讨论。
                    分享你的专业见解和实战经验。
                    """
                else:
                    task_description = base_task + f"""
                    作为技术探索者，针对专家的技术分析提出深度问题。
                    探讨实现细节、性能优化、可能的技术风险等。
                    分享你的学习心得和技术思考。
                    """
            else:
                task_description = base_task + f"""
                基于当前场景和对话记录，继续技术讨论。
                深入探讨技术细节，分享经验和见解。
                保持专业的交流氛围。
                """
            
            return Task(
                description=task_description,
                expected_output="一个专业的技术回复，包含具体的技术内容和见解，建议2-3句话。",
                agent=agent
            )
        else:
            # Original task creation logic for SARCASTIC_NETIZEN
            base_task = f"""你是一个网络杠精，要在对话中保持自己的人设。
            当前场景：{scenario}
            
            对话要求：
            1. 每次回复不超过2句话
            2. 不要重复使用相同的词汇和句式
            3. 不要真情实感，保持互怼的状态
            4. 始终围绕当前场景讨论，不要偏离主题
            
            之前的对话记录：
            {conversation_history}
            """
            
            if is_first_round:
                if "Agent A" in agent.role:
                    task_description = base_task + f"""
                    作为开场，你要针对"{scenario}"这个场景进行犀利的吐槽。
                    直接点出场景中的槽点，语气要暴躁，不留情面。
                    """
                else:
                    task_description = base_task + f"""
                    对方刚刚针对"{scenario}"进行了吐槽。
                    用阴阳怪气的方式回应对方的吐槽，表面温和，实则暗藏杀机。
                    """
            else:
                task_description = base_task + f"""
                基于当前场景和对话记录，继续进行互怼。
                抓住对方话语中的破绽和漏洞进行反击。
                不要简单重复对方的话，而是要找到新的角度进行攻击。
                保持自己的说话风格。
                """
            
            return Task(
                description=task_description,
                expected_output="一个简短但犀利的回复，体现角色特点，不超过2句话。",
                agent=agent
            )
    
    def process_agent_turn(self, agent, context, current_round, agent_index, is_first_round=False):
        agent_name = f"Agent {chr(65 + agent_index)}"
        
        # Emit typing indicator
        socketio.emit('agentTyping', {
            'round': current_round,
            'agent': agent_name
        })
        
        # Allow frontend to update
        eventlet.sleep(0)
        
        # Create and execute task
        task = self.create_conversation_task(
            agent, 
            context,
            is_first_round=is_first_round
        )
        
        crew = Crew(
            agents=[agent],
            tasks=[task],
            verbose=True,
            process=Process.sequential
        )
        
        result = crew.kickoff()
        result_str = str(result).strip()
        
        # Store message in conversation history
        self.conversation_history.append({
            'round': current_round,
            'agent': agent_name,
            'message': result_str
        })
        
        # Emit response immediately
        socketio.emit('conversationUpdate', {
            'round': current_round,
            'agent': agent_name,
            'message': result_str
        })
        
        # Allow frontend to update
        eventlet.sleep(0)
        
        return result_str
    
    def run_conversation(self, data):
        try:
            self.config = self.parse_user_input(data)
            if not self.is_continuation:
                self.conversation_history = []  # Reset only for new conversations
            
            self.stop_requested = False
            agents = self.create_agents()
            context = self.config['background']
            
            # Initial round update
            socketio.emit('roundUpdate', {
                'round': self.current_round + 1,
                'total': self.total_rounds
            })
            eventlet.sleep(0)
            
            # Run for 3 rounds at a time
            rounds_per_batch = 3
            start_round = self.current_round
            end_round = min(start_round + rounds_per_batch, self.total_rounds)
            
            for round in range(start_round, end_round):
                if self.stop_requested:
                    break
                    
                self.current_round = round + 1
                
                for agent_index, agent in enumerate(agents):
                    if self.stop_requested:
                        break
                        
                    context = self.process_agent_turn(
                        agent,
                        context,
                        self.current_round,
                        agent_index,
                        is_first_round=(round == 0 and agent_index == 0)
                    )
                
                # Update round progress
                socketio.emit('roundUpdate', {
                    'round': self.current_round,
                    'total': self.total_rounds,
                    'can_continue': self.current_round < self.total_rounds
                })
                eventlet.sleep(0)
            
            if self.stop_requested:
                socketio.emit('conversationStopped', {
                    'current_round': self.current_round,
                    'can_continue': self.current_round < self.total_rounds
                })
            elif self.current_round >= self.total_rounds:
                socketio.emit('conversationComplete')
            else:
                socketio.emit('batchComplete', {
                    'current_round': self.current_round,
                    'can_continue': True
                })
            
        except Exception as error:
            print(f"Error in conversation: {str(error)}")
            socketio.emit('error', {'message': str(error)})
    
    def stop_conversation(self):
        self.stop_requested = True

@socketio.on('connect')
def handle_connect():
    print('Client connected:', request.sid)

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected:', request.sid)

@socketio.on('stopConversation')
def handle_stop_conversation():
    print('Stop conversation requested by:', request.sid)
    orchestrator = ConversationOrchestrator(socketio)
    orchestrator.stop_conversation()
    socketio.emit('conversationStopped')

@socketio.on('getChatHistory')
def handle_get_chat_history(data):
    """Handle request for chat history."""
    session_id = data.get('session_id', 'default')
    orchestrator = ConversationOrchestrator(socketio)
    history = orchestrator.get_chat_history(session_id)
    socketio.emit('chatHistory', {'history': history})

@socketio.on('clearChatHistory')
def handle_clear_chat_history(data):
    """Handle request to clear chat history."""
    session_id = data.get('session_id', 'default')
    orchestrator = ConversationOrchestrator(socketio)
    orchestrator.clear_chat_history(session_id)
    socketio.emit('chatHistoryCleared', {'session_id': session_id})

@socketio.on('voiceInput')
def handle_voice_input(data):
    """Handle voice input from client."""
    audio_data = data.get('audio')
    session_id = data.get('session_id', 'default')
    orchestrator = ConversationOrchestrator(socketio)
    
    # Process voice input
    text = orchestrator.process_voice_input(audio_data)
    if text:
        # If voice processing successful, start conversation with transcribed text
        data['prompt'] = text
        eventlet.spawn(orchestrator.run_conversation, data)
    else:
        socketio.emit('error', {'message': 'Voice input processing failed'})

@socketio.on('getModelConfig')
def handle_get_model_config():
    """Handle request for model configuration."""
    socketio.emit('modelConfig', {'config': MODEL_CONFIGS})

@socketio.on('startConversation')
def handle_start_conversation(data):
    """Handle start conversation request with enhanced features."""
    if not data.get('prompt') and not data.get('is_continuation'):
        socketio.emit('error', {'message': 'No prompt provided'})
        return
    
    # Store session ID for chat history
    session_id = data.get('session_id', 'default')
    
    # Create orchestrator instance
    orchestrator = ConversationOrchestrator(socketio)
    
    # Start conversation in a new greenlet
    eventlet.spawn(orchestrator.run_conversation, data)

@socketio.on('singleAIMessage')
def handle_single_ai_message(data):
    """Handle single AI chat messages."""
    message = data.get('message')
    
    if not message:
        socketio.emit('error', {'message': 'No message provided'})
        return
        
    try:
        # Always use gpt-4o-mini model for now
        model_config = {
            "api_key": os.getenv("OPENAI_API_KEY"),
            "provider": "openai"
        }
            
        # Create a single agent for response
        agent = Agent(
            role="AI Assistant",
            goal="Provide helpful and accurate responses to user queries",
            backstory="You are a helpful AI assistant engaging in a one-on-one conversation.",
            verbose=True,
            allow_delegation=False,
            llm_model="gpt-4o-mini",
            **model_config
        )
        
        # Create and execute task
        task = Task(
            description=f"Respond to the user's message: {message}",
            expected_output="A helpful and relevant response to the user's message.",
            agent=agent
        )
        
        crew = Crew(
            agents=[agent],
            tasks=[task],
            verbose=True,
            process=Process.sequential
        )
        
        # Get response
        result = crew.kickoff()
        response = str(result).strip()
        
        # Emit response
        socketio.emit('message', {'content': response})
        
    except Exception as error:
        print(f"Error in single AI conversation: {str(error)}")
        socketio.emit('error', {'message': str(error)})

@socketio.on('stopGeneration')
def handle_stop_generation():
    """Handle request to stop AI response generation."""
    # TODO: Implement actual stopping mechanism
    socketio.emit('message', {'content': '[Generation stopped by user]'})

if __name__ == '__main__':
    print("Starting server with eventlet...")
    socketio.run(app, port=5000, debug=True) 