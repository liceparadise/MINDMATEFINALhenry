from django.http import HttpResponse

class ViteClientMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Check if the request is for the Vite client
        if request.path.startswith('/@vite/client'):
            # Return an empty response with 200 status code
            return HttpResponse('', content_type='application/javascript')
        
        # Process the request normally for all other requests
        return self.get_response(request)